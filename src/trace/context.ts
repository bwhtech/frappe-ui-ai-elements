import { inject, provide, type InjectionKey, type Ref } from "vue";

export type TraceStatus = "running" | "error" | "pending";

export interface TraceCollapsibleContext {
	open: Readonly<Ref<boolean>>;
	contentId: string;
	toggle: () => void;
}

const key: InjectionKey<TraceCollapsibleContext> = Symbol("TraceCollapsible");

export function provideTraceCollapsible(context: TraceCollapsibleContext) {
	provide(key, context);
}

export function useTraceCollapsible(component: string) {
	const context = inject(key, null);
	if (!context) throw new Error(`<${component}> must be used inside <TraceCollapsible>`);
	return context;
}
