import { reactive, ref } from "vue";
import { blockPadding, contentBottom, elementTop, flexGap, scrollItems } from "./geometry";
import { PrependAnchor } from "./prepend";
import { MessageScrollerVisibility } from "./visibility";
import type { MessageScrollerOptions, MessageScrollerScrollOptions } from "./types";

type Mode =
	| "following-bottom" // pinned to the latest message
	| "free-scrolling" // the reader scrolled away; leave the position alone
	| "anchored-to-message"; // holding a new turn near the top while its reply streams

const EPSILON = 0.5;
const AUTOSCROLL_CLEAR_DELAY = 400;
const USER_SCROLL_KEYS = new Set(["ArrowDown", "ArrowUp", "End", "Home", "PageDown", "PageUp", " "]);

/**
 * Owns scroll position for a chat transcript: follows the live end while the
 * reader is there, anchors each new `scrollAnchor` turn near the top while its
 * reply streams below it, lets go as soon as the reader scrolls, and keeps the
 * reader's row in place when older rows are inserted above it.
 * A Vue port of shadcn's headless MessageScroller.
 */
export class MessageScrollerController {
	readonly scrollable = reactive({ start: false, end: false });
	readonly autoscrolling = ref(false);
	readonly pendingScroll = ref(true);
	readonly visibility = new MessageScrollerVisibility({
		viewport: () => this.viewport,
		content: () => this.content,
		spacer: () => this.spacer,
		readingLine: () => this.options().scrollMargin + this.options().scrollPreviousItemPeek,
	});
	/** Keep the first visible row still when rows are inserted above it. Set by the viewport. */
	preserveScrollOnPrepend = true;
	/** Called when the viewport reaches the start edge, e.g. to load older rows. Set by the viewport. */
	onReachStart: (() => void) | null = null;

	private viewport: HTMLElement | null = null;
	private content: HTMLElement | null = null;
	private spacer: HTMLElement | null = null;
	private mode: Mode = "free-scrolling";
	private itemCount = 0;
	private anchor: HTMLElement | null = null;
	private handledAnchors = new WeakSet<HTMLElement>();
	private prependAnchor = new PrependAnchor();
	private lastScrollTop = 0;
	/** Where the controller last put the viewport; a scroll away from it is the reader's. */
	private scrollTarget: number | null = null;
	private spacerHeight = 0;
	private frame: number | null = null;
	private autoscrollTimer: ReturnType<typeof setTimeout> | null = null;
	private resizeObserver: ResizeObserver | null = null;
	private mutationObserver: MutationObserver | null = null;

	constructor(private readonly options: () => MessageScrollerOptions) {}

	// --- wiring -----------------------------------------------------------

	setViewport(element: HTMLElement | null) {
		this.viewport = element;
		this.connect();
		this.visibility.reconnect();
	}

	setContent(element: HTMLElement | null) {
		this.content = element;
		this.connect();
	}

	setSpacer(element: HTMLElement | null) {
		this.spacer = element;
	}

	disconnect() {
		this.resizeObserver?.disconnect();
		this.mutationObserver?.disconnect();
		this.resizeObserver = this.mutationObserver = null;
		this.visibility.disconnect();
		if (this.frame !== null) cancelAnimationFrame(this.frame);
		if (this.autoscrollTimer) clearTimeout(this.autoscrollTimer);
	}

	// --- commands ---------------------------------------------------------

	scrollToEnd(options: MessageScrollerScrollOptions = {}) {
		const viewport = this.viewport;
		if (!viewport || !this.content) return false;
		this.setSpacerHeight(0);
		const top = Math.max(0, this.contentBottom() - viewport.clientHeight);
		this.mode = this.options().autoScroll ? "following-bottom" : "free-scrolling";
		this.anchor = null;
		this.scrollTo(top, options.behavior ?? "smooth");
		return true;
	}

	scrollToStart(options: MessageScrollerScrollOptions = {}) {
		if (!this.viewport) return false;
		this.mode = "free-scrolling";
		this.anchor = null;
		this.scrollTo(0, options.behavior ?? "smooth");
		return true;
	}

	scrollToMessage(messageId: string, options: MessageScrollerScrollOptions = {}) {
		const item = this.items().find((element) => element.dataset.messageId === messageId);
		if (!item || !this.viewport) return false;
		this.mode = "free-scrolling";
		this.anchor = null;
		this.scrollTo(this.alignedTop(item, options), options.behavior ?? "smooth");
		return true;
	}

	// --- DOM events -------------------------------------------------------

	onScroll() {
		const viewport = this.viewport;
		if (!viewport) return;
		const scrolledUp = viewport.scrollTop < this.lastScrollTop - EPSILON;
		// Scrollbar drags, find-in-page and focus moves send no wheel or key event; this catches them.
		const movedAway = this.movedAwayFromTarget(viewport.scrollTop);
		this.lastScrollTop = viewport.scrollTop;
		const atEnd = !this.hasOverflowBelow();

		this.capturePrependAnchor();
		this.visibility.schedule();
		if (movedAway) this.releaseToReader();
		if (this.autoscrolling.value) return this.commitState();
		if (this.mode === "following-bottom" && scrolledUp) this.mode = "free-scrolling";
		else if (this.mode === "free-scrolling" && atEnd && this.options().autoScroll) {
			this.mode = "following-bottom";
			this.scrollTarget = null;
		}
		this.trimSpacer();
		this.commitState();
	}

	onWheel(event: WheelEvent) {
		if (event.deltaY < 0 || this.mode === "anchored-to-message") this.releaseToReader();
	}

	onTouchMove() {
		this.releaseToReader();
	}

	onKeydown(event: KeyboardEvent) {
		if (isEditable(event.target)) return;
		if (USER_SCROLL_KEYS.has(event.key)) this.releaseToReader();
	}

	/** A press on the viewport's own scrollbar starts a drag. */
	onPointerDown(event: PointerEvent) {
		const viewport = this.viewport;
		if (!viewport || event.target !== viewport) return;
		if (event.offsetX > viewport.clientWidth || event.offsetY > viewport.clientHeight) this.releaseToReader();
	}

	// --- reconciliation ---------------------------------------------------

	private connect() {
		if (!this.viewport || !this.content || this.resizeObserver) return;
		this.resizeObserver = new ResizeObserver(() => this.schedule(() => this.handleResize()));
		this.resizeObserver.observe(this.viewport);
		this.resizeObserver.observe(this.content);
		this.mutationObserver = new MutationObserver(() => this.handleContentChange());
		this.mutationObserver.observe(this.content, { childList: true });
		this.handleContentChange();
		if (this.itemCount === 0) this.pendingScroll.value = false;
	}

	private handleContentChange() {
		this.reconcileContent();
		this.capturePrependAnchor();
		this.visibility.schedule();
	}

	/** Branch order matters: first content, then rows inserted above, then appends. */
	private reconcileContent() {
		const items = this.items();
		const previousCount = this.itemCount;
		this.itemCount = items.length;

		if (previousCount === 0) {
			if (items.length > 0) this.applyDefaultScrollPosition(items);
			return this.commitState();
		}
		if (this.handlePrepend(items)) return;
		if (items.length > previousCount) {
			const anchors = items.slice(previousCount).filter(isScrollAnchor);
			const following = this.mode === "following-bottom" && this.options().autoScroll;
			if (anchors.length > 1 && following) return void this.scrollToEnd({ behavior: "auto" });
			const anchor = anchors[0] ?? items.find((item) => isScrollAnchor(item) && !this.handledAnchors.has(item));
			if (anchor) return this.anchorTo(anchor, "smooth");
		}
		if (this.mode === "following-bottom" && this.options().autoScroll) this.scrollToEnd({ behavior: "auto" });
		else this.commitState();
	}

	private handleResize() {
		this.visibility.schedule();
		this.reconcileResize();
		this.capturePrependAnchor();
	}

	private reconcileResize() {
		if (this.mode === "following-bottom" && this.options().autoScroll) {
			this.scrollToEnd({ behavior: "auto" });
			return;
		}
		// The anchored turn left the DOM (the chat changed, the row re-rendered): stop holding it.
		if (this.mode === "anchored-to-message" && !this.anchor?.isConnected) this.releaseToReader();
		if (this.mode === "anchored-to-message" && this.anchor?.isConnected) {
			const previousSpacer = this.spacerHeight;
			this.holdAnchor();
			// The reply has filled the space under the anchor: hand off to following.
			if (this.options().autoScroll && previousSpacer > 0 && this.spacerHeight === 0) {
				this.scrollToEnd({ behavior: "auto" });
			}
			return;
		}
		// Rows above the reader changed height (markdown settling, a loader swapping in).
		// Hold the reader's row, as native scroll anchoring does where the browser has it.
		if (this.preserveScrollOnPrepend && this.viewport) this.prependAnchor.restore(this.viewport);
		this.lastScrollTop = this.viewport?.scrollTop ?? 0;
		this.trimSpacer();
		this.commitState();
	}

	private applyDefaultScrollPosition(items: HTMLElement[]) {
		const position = this.options().defaultScrollPosition;
		items.filter(isScrollAnchor).forEach((item) => this.handledAnchors.add(item));
		if (position === "start") this.scrollToStart({ behavior: "auto" });
		else if (position === "last-anchor") this.openAtLastAnchor(items);
		else this.scrollToEnd({ behavior: "auto" });
		requestAnimationFrame(() => (this.pendingScroll.value = false));
	}

	private openAtLastAnchor(items: HTMLElement[]) {
		const anchor = items.toReversed().find(isScrollAnchor);
		const viewport = this.viewport!;
		const lastTurnFits = anchor && this.contentBottom() - elementTop(anchor, viewport) <= viewport.clientHeight;
		if (!anchor || lastTurnFits) this.scrollToEnd({ behavior: "auto" });
		else this.anchorTo(anchor, "auto");
	}

	/** Puts `element` near the top, adding a tail spacer if the content below is short. */
	private anchorTo(element: HTMLElement, behavior: ScrollBehavior) {
		this.handledAnchors.add(element);
		this.anchor = element;
		this.mode = "anchored-to-message";
		this.holdAnchor(behavior);
	}

	private holdAnchor(behavior: ScrollBehavior = "auto") {
		const viewport = this.viewport;
		if (!viewport || !this.anchor) return;
		if (!this.anchor.isConnected) return void this.releaseToReader();
		const peek = this.options().scrollPreviousItemPeek;
		const target = Math.max(0, this.alignedTop(this.anchor, { align: "start" }) - peek);
		const missing = target + viewport.clientHeight - this.contentBottom();
		this.setSpacerHeight(Math.max(0, missing));
		if (Math.abs(viewport.scrollTop - target) > EPSILON) this.scrollTo(target, behavior);
		this.commitState();
	}

	/** Shrinks the tail spacer to what the current scroll position still needs. */
	private trimSpacer() {
		if (this.spacerHeight === 0 || !this.viewport) return;
		const needed = this.viewport.scrollTop + this.viewport.clientHeight - this.contentBottom();
		this.setSpacerHeight(Math.max(0, Math.min(this.spacerHeight, needed)));
	}

	private capturePrependAnchor() {
		this.prependAnchor.capture(this.items(), this.viewport);
	}

	/**
	 * Older rows were inserted above the reader. They are history, not a new
	 * turn, so their anchors are never scrolled to. Keeps the reader's row
	 * still unless `preserveScrollOnPrepend` is off.
	 */
	private handlePrepend(items: HTMLElement[]) {
		if (!this.prependAnchor.moved(items)) return false;
		items.filter(isScrollAnchor).forEach((item) => this.handledAnchors.add(item));
		if (this.preserveScrollOnPrepend && this.viewport) {
			this.prependAnchor.restore(this.viewport);
			this.lastScrollTop = this.viewport.scrollTop;
		}
		// Rows above an anchored turn moved it down; re-pin it at the reading line.
		if (this.mode === "anchored-to-message") this.holdAnchor();
		else this.commitState();
		return true;
	}

	private releaseToReader() {
		if (this.mode !== "free-scrolling") this.mode = "free-scrolling";
		this.anchor = null;
		this.scrollTarget = null;
		this.setAutoscrolling(false);
	}

	/**
	 * The viewport moved further from where the controller put it. A smooth scroll only
	 * closes the distance, so a growing distance is the reader. While following, only a
	 * move up counts: rows above settling can push the position down, toward the end anyway.
	 */
	private movedAwayFromTarget(top: number) {
		const viewport = this.viewport;
		if (!viewport || this.mode === "free-scrolling" || this.scrollTarget === null) return false;
		// Content that shrank clamps the position; measure against the reachable target.
		const target = Math.min(this.scrollTarget, Math.max(0, viewport.scrollHeight - viewport.clientHeight));
		if (Math.abs(top - target) <= Math.abs(this.lastScrollTop - target) + EPSILON) return false;
		return this.mode === "anchored-to-message" || top < this.lastScrollTop;
	}

	private commitState() {
		const viewport = this.viewport;
		if (!viewport) return;
		const threshold = this.options().scrollEdgeThreshold;
		const wasAwayFromStart = this.scrollable.start;
		this.scrollable.start = viewport.scrollTop > threshold;
		if (wasAwayFromStart && !this.scrollable.start && this.itemCount > 0) this.onReachStart?.();
		// While following, a streamed chunk opens a gap we are about to close; do not flash the button.
		this.scrollable.end = this.mode !== "following-bottom" && this.hasOverflowBelow();
	}

	// --- low-level helpers ------------------------------------------------

	private hasOverflowBelow() {
		const viewport = this.viewport!;
		return this.contentBottom() - viewport.scrollTop - viewport.clientHeight > this.options().scrollEdgeThreshold;
	}

	private alignedTop(element: HTMLElement, options: MessageScrollerScrollOptions) {
		const viewport = this.viewport!;
		const margin = options.scrollMargin ?? this.options().scrollMargin;
		const padding = blockPadding(this.content);
		const top = elementTop(element, viewport);
		const height = element.getBoundingClientRect().height;
		if (options.align === "end") return top - viewport.clientHeight + height + padding.end + margin;
		if (options.align === "center") return top - (viewport.clientHeight - height) / 2;
		return top - padding.start - margin;
	}

	private contentBottom() {
		return contentBottom(this.content!, this.spacer, this.viewport!);
	}

	private items() {
		return this.content ? scrollItems(this.content, this.spacer) : [];
	}

	private setSpacerHeight(height: number) {
		this.spacerHeight = Math.round(height);
		if (!this.spacer) return;
		// The content's flex gap already separates the spacer from the last item.
		const gap = flexGap(this.content);
		this.spacer.style.display = this.spacerHeight > 0 ? "block" : "none";
		this.spacer.style.height = `${Math.max(0, this.spacerHeight - gap)}px`;
	}

	private scrollTo(top: number, requested: ScrollBehavior) {
		const viewport = this.viewport!;
		const behavior = requested === "smooth" && prefersReducedMotion() ? "auto" : requested;
		if (behavior === "smooth") this.setAutoscrolling(true);
		viewport.scrollTo({ top, behavior });
		this.lastScrollTop = viewport.scrollTop;
		this.scrollTarget = top;
		this.commitState();
	}

	private setAutoscrolling(value: boolean) {
		if (this.autoscrollTimer) clearTimeout(this.autoscrollTimer);
		this.autoscrolling.value = value;
		if (value) this.autoscrollTimer = setTimeout(() => this.setAutoscrolling(false), AUTOSCROLL_CLEAR_DELAY);
	}

	private schedule(task: () => void) {
		if (this.frame !== null) return;
		this.frame = requestAnimationFrame(() => {
			this.frame = null;
			task();
		});
	}
}

function prefersReducedMotion() {
	return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/** Keys typed in a field move its caret, not the transcript. */
function isEditable(target: EventTarget | null) {
	if (!(target instanceof HTMLElement)) return false;
	return target.isContentEditable || target.matches("input, textarea, select");
}

function isScrollAnchor(element: HTMLElement) {
	return element.dataset.scrollAnchor === "true";
}
