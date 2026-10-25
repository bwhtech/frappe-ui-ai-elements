import { inject, provide, type Component, type InjectionKey } from "vue";

/**
 * An app's own drawing for one of its tools. ToolPart draws a tool named here
 * with the given component, passing `part` and `streaming`, instead of a Tool line.
 * Approvals still come first: a call that waits on the person shows a Confirmation.
 */
export type ToolRenderers = Record<string, Component>;

const KEY: InjectionKey<ToolRenderers> = Symbol("tool-renderers");

export function provideToolRenderers(renderers: ToolRenderers) {
	provide(KEY, renderers);
}

export function useToolRenderers() {
	return inject(KEY, {});
}
