import { inject, provide, type InjectionKey } from "vue";

/**
 * An app's name for one of its tools, such as "Linear · Create issue" for a connector's
 * linear__create_issue. ToolPart shows it in place of the humanized tool name. With
 * `alwaysAllow`, a call that waits for approval also offers "Always allow": it runs
 * `alwaysAllow` (which saves the rule), then approves.
 */
export type ToolLabel = { title: string; question?: string; alwaysAllow?: () => Promise<void> };
export type ToolLabeler = (toolName: string) => ToolLabel | undefined;

const KEY: InjectionKey<ToolLabeler> = Symbol("tool-labels");

export function provideToolLabels(labeler: ToolLabeler) {
	provide(KEY, labeler);
}

export function useToolLabels(): ToolLabeler {
	return inject(KEY, () => undefined);
}
