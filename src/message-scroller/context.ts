import { computed, inject, onScopeDispose, provide, reactive, readonly, type InjectionKey } from "vue";
import type { MessageScrollerController } from "./controller";

const key: InjectionKey<MessageScrollerController> = Symbol("MessageScroller");

export function provideMessageScroller(controller: MessageScrollerController) {
	provide(key, controller);
}

export function injectMessageScroller(optional = false) {
	const controller = inject(key, null);
	if (!controller && !optional) throw new Error("MessageScroller parts must be used inside <MessageScrollerProvider>");
	return controller as MessageScrollerController;
}

/** Scroll commands for the nearest MessageScrollerProvider. */
export function useMessageScroller() {
	const controller = injectMessageScroller();
	return {
		scrollToEnd: controller.scrollToEnd.bind(controller),
		scrollToStart: controller.scrollToStart.bind(controller),
		scrollToMessage: controller.scrollToMessage.bind(controller),
	};
}

/** `{ start, end }`: the edges the viewport can still scroll toward. */
export function useMessageScrollerScrollable() {
	return readonly(injectMessageScroller().scrollable);
}

/**
 * Where the reader is: `currentAnchorId` (the anchored turn they are in, kept
 * after its top scrolls away), `visibleMessageIds` in document order, and the
 * first and last of those. Rows need a `messageId`. Tracking runs only while a
 * component using this is mounted.
 */
export function useMessageScrollerVisibility() {
	const { visibility } = injectMessageScroller();
	onScopeDispose(visibility.subscribe());
	const state = visibility.state;
	return readonly(
		reactive({
			currentAnchorId: computed(() => state.value.currentAnchorId),
			visibleMessageIds: computed(() => state.value.visibleMessageIds),
			firstVisibleMessageId: computed(() => state.value.visibleMessageIds[0] ?? null),
			lastVisibleMessageId: computed(() => state.value.visibleMessageIds.at(-1) ?? null),
		}),
	);
}
