import { computed, inject, provide, type ComputedRef, type InjectionKey } from "vue";

export type MessageRole = "user" | "assistant" | "system";

const key: InjectionKey<ComputedRef<MessageRole>> = Symbol("Message");

export function provideMessageRole(role: () => MessageRole) {
	provide(key, computed(role));
}

export function useMessageRole() {
	return inject(key, computed(() => "assistant" as MessageRole));
}
