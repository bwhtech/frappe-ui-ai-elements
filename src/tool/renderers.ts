import { inject, provide, type Component, type InjectionKey } from "vue";

/**
 * An app's own drawing for one of its tools. ToolPart draws a tool named here
 * with the given component, passing `part` and `streaming`, instead of a Tool line.
 * Approvals still come first: a call that waits on the person shows a Confirmation.
 *
 * A tool drawn this way stays out of folds (work-group.ts), as its drawing is something
 * the person reads. Name it in `foldable` when it draws one plain line, so it folds
 * with the steps around it.
 */
export type ToolRenderers = Record<string, Component>;

type Provided = { renderers: ToolRenderers; foldable: Set<string> };
const KEY: InjectionKey<Provided> = Symbol("tool-renderers");

export function provideToolRenderers(renderers: ToolRenderers, { foldable = [] as string[] } = {}) {
	provide(KEY, { renderers, foldable: new Set(foldable) });
}

export function useToolRenderers() {
	return inject(KEY, { renderers: {}, foldable: new Set<string>() }).renderers;
}

/** The tools with their own drawing that must not fold. */
export function useUnfoldableTools() {
	const { renderers, foldable } = inject(KEY, { renderers: {}, foldable: new Set<string>() });
	return new Set(Object.keys(renderers).filter((name) => !foldable.has(name)));
}
