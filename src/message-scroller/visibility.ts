import { shallowRef } from "vue";
import { scrollItems } from "./geometry";

export interface MessageScrollerVisibilityState {
	/** The anchored turn the reader is in. Stays set after the anchor scrolls above the viewport. */
	currentAnchorId: string | null;
	/** `messageId` values intersecting the viewport, in document order. */
	visibleMessageIds: string[];
}

interface VisibilityHost {
	viewport(): HTMLElement | null;
	content(): HTMLElement | null;
	spacer(): HTMLElement | null;
	/** Pixels below the viewport top where an anchored turn lands: scrollMargin + scrollPreviousItemPeek. */
	readingLine(): number;
}

const EMPTY: MessageScrollerVisibilityState = Object.freeze({ currentAnchorId: null, visibleMessageIds: [] as string[] });
const EPSILON = 0.5;

/**
 * Tracks which MessageScrollerItems are on screen. Pay for what you use: the
 * IntersectionObserver only exists while something subscribes. Commits are
 * coalesced to one per frame, and the current anchor is found by binary
 * search, so a long thread costs a few rect reads per frame.
 */
export class MessageScrollerVisibility {
	readonly state = shallowRef<MessageScrollerVisibilityState>(EMPTY);

	private elements = new Map<string, HTMLElement>();
	private visible = new Set<string>();
	private observer: IntersectionObserver | null = null;
	private subscribers = 0;
	private frame: number | null = null;

	constructor(private readonly host: VisibilityHost) {}

	/** Starts tracking on the first subscriber. Returns the unsubscribe function. */
	subscribe() {
		if (++this.subscribers === 1) this.observe();
		let subscribed = true;
		return () => {
			if (!subscribed) return;
			subscribed = false;
			if (--this.subscribers === 0) this.unobserve();
		};
	}

	register(messageId: string, element: HTMLElement) {
		const previous = this.elements.get(messageId);
		if (previous && previous !== element) this.observer?.unobserve(previous);
		this.elements.set(messageId, element);
		this.observer?.observe(element);
		this.schedule();
	}

	unregister(messageId: string, element: HTMLElement) {
		if (this.elements.get(messageId) !== element) return;
		this.elements.delete(messageId);
		this.visible.delete(messageId);
		this.observer?.unobserve(element);
		this.schedule();
	}

	/** The viewport was attached or replaced: rebuild the observer on the new root. */
	reconnect() {
		if (!this.subscribers) return;
		this.unobserve();
		this.observe();
	}

	/** Recomputes on the next frame. Scrolling moves the current anchor without any intersection change. */
	schedule() {
		if (!this.subscribers || this.frame !== null) return;
		this.frame = requestAnimationFrame(() => {
			this.frame = null;
			// A frame can outlive the last unsubscribe; keep the empty snapshot it wrote.
			if (this.subscribers) this.commit();
		});
	}

	disconnect() {
		this.unobserve();
		this.subscribers = 0;
	}

	private observe() {
		const viewport = this.host.viewport();
		if (!viewport) return;
		if (typeof IntersectionObserver === "undefined") return this.schedule();
		this.observer = new IntersectionObserver((entries) => this.onIntersect(entries), {
			root: viewport,
			// Shrink the top edge to the reading line, so a previous turn peeking above an anchored row is not "visible".
			rootMargin: `${-this.host.readingLine()}px 0px 0px 0px`,
			threshold: [0, 0.01],
		});
		this.elements.forEach((element) => this.observer!.observe(element));
		this.schedule();
	}

	private unobserve() {
		if (this.frame !== null) cancelAnimationFrame(this.frame);
		this.frame = null;
		this.observer?.disconnect();
		this.observer = null;
		this.visible.clear();
		this.state.value = EMPTY;
	}

	private onIntersect(entries: IntersectionObserverEntry[]) {
		for (const entry of entries) {
			const messageId = (entry.target as HTMLElement).dataset.messageId;
			if (!messageId) continue;
			if (entry.isIntersecting) this.visible.add(messageId);
			else this.visible.delete(messageId);
		}
		this.schedule();
	}

	private commit() {
		const viewport = this.host.viewport();
		const content = this.host.content();
		if (!viewport || !content) return;
		const lineTop = viewport.getBoundingClientRect().top + this.host.readingLine();
		const next = { currentAnchorId: this.currentAnchor(content, lineTop), visibleMessageIds: this.visibleIds(viewport, lineTop) };
		if (!isSameState(this.state.value, next)) this.state.value = next.currentAnchorId || next.visibleMessageIds.length ? next : EMPTY;
	}

	/** The last anchor at or above the reading line. Rows are stacked, so binary search works. */
	private currentAnchor(content: HTMLElement, lineTop: number) {
		const anchors = scrollItems(content, this.host.spacer()).filter((item) => item.dataset.scrollAnchor === "true" && item.dataset.messageId);
		let low = 0;
		let high = anchors.length - 1;
		let found: HTMLElement | null = null;
		while (low <= high) {
			const middle = (low + high) >> 1;
			if (anchors[middle].getBoundingClientRect().top <= lineTop + EPSILON) {
				found = anchors[middle];
				low = middle + 1;
			} else high = middle - 1;
		}
		return found?.dataset.messageId ?? null;
	}

	private visibleIds(viewport: HTMLElement, lineTop: number) {
		const ids = this.observer ? [...this.visible] : this.visibleByLayout(viewport, lineTop);
		return ids
			.map((id) => [id, this.elements.get(id)] as const)
			.filter((pair): pair is readonly [string, HTMLElement] => !!pair[1])
			.toSorted(([, a], [, b]) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
			.map(([id]) => id);
	}

	/** Fallback where IntersectionObserver is missing. */
	private visibleByLayout(viewport: HTMLElement, lineTop: number) {
		const bottom = viewport.getBoundingClientRect().bottom;
		return [...this.elements]
			.filter(([, element]) => {
				const rect = element.getBoundingClientRect();
				return rect.bottom > lineTop && rect.top < bottom;
			})
			.map(([id]) => id);
	}
}

function isSameState(a: MessageScrollerVisibilityState, b: MessageScrollerVisibilityState) {
	return (
		a.currentAnchorId === b.currentAnchorId &&
		a.visibleMessageIds.length === b.visibleMessageIds.length &&
		a.visibleMessageIds.every((id, index) => id === b.visibleMessageIds[index])
	);
}
