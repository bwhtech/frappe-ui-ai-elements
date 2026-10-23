import { inject, provide, type InjectionKey, type Ref } from "vue";

interface ReasoningContext {
	isStreaming: Ref<boolean>;
	/** Seconds spent thinking, once known. */
	duration: Ref<number | undefined>;
}

const key: InjectionKey<ReasoningContext> = Symbol("Reasoning");

export function provideReasoning(context: ReasoningContext) {
	provide(key, context);
}

export function useReasoning() {
	const context = inject(key, null);
	if (!context) throw new Error("Reasoning parts must be used inside <Reasoning>");
	return context;
}
