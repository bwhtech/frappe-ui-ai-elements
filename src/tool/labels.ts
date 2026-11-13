import { inject, provide, type InjectionKey } from "vue";
import type { ToolMessagePart } from "./state";

/**
 * An app's name for one of its tools, such as "Linear · Create issue" for a connector's
 * linear__create_issue. ToolPart shows it in place of the humanized tool name. With
 * `alwaysAllow`, a call that waits for approval also offers "Always allow": it runs
 * `alwaysAllow` (which saves the rule), then approves.
 *
 * The labeler also gets the call, so a tool that runs other tools, such as a
 * `call_tool({ name, input })`, can be named after the tool it runs:
 * - `input`: what the approval card and the step's details show in place of the call's own input.
 * - `action`: whether the step reads or changes something, for a folded run's summary
 *   ("Looked up 2 things and made 1 change"). Without it, the summary guesses from the tool's name.
 * - `icon`: the step's icon, in place of the one guessed from the tool's name.
 */
export type ToolLabel = {
	title: string;
	question?: string;
	alwaysAllow?: () => Promise<void>;
	input?: unknown;
	action?: ToolAction;
	icon?: string;
};
export type ToolAction = "read" | "write" | "other";
export type ToolLabeler = (toolName: string, part?: ToolMessagePart) => ToolLabel | undefined;

const KEY: InjectionKey<ToolLabeler> = Symbol("tool-labels");

export function provideToolLabels(labeler: ToolLabeler) {
	provide(KEY, labeler);
}

export function useToolLabels(): ToolLabeler {
	return inject(KEY, () => undefined);
}
