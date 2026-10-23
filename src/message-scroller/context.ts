import { inject, provide, readonly, type InjectionKey } from "vue";
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
