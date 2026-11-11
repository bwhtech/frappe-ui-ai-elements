import { computed, inject, provide, type ComputedRef, type InjectionKey } from "vue";

export type MessageRole = "user" | "assistant" | "system";

const key: InjectionKey<ComputedRef<MessageRole>> = Symbol("Message");

export function provideMessageRole(role: () => MessageRole) {
	provide(key, computed(role));
}

export function useMessageRole() {
	return inject(key, computed(() => "assistant" as MessageRole));
}

const bubbleKey: InjectionKey<ComputedRef<boolean>> = Symbol("MessageBubble");

/** MessageContent says whether it already draws the person's bubble, so MessageParts does not draw a second. */
export function provideInBubble(inBubble: () => boolean) {
	provide(bubbleKey, computed(inBubble));
}

export function useInBubble() {
	return inject(bubbleKey, computed(() => false));
}
