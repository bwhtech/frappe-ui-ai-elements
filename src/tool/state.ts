import type { DynamicToolUIPart, ToolUIPart } from "ai";
import type { TraceStatus } from "../trace";

export type ToolMessagePart = ToolUIPart | DynamicToolUIPart;
export type ToolState = ToolMessagePart["state"];
export type BadgeTheme = "gray" | "blue" | "green" | "amber" | "red" | "violet";

export interface ToolStateContext {
	/** The chat is still streaming this message. A running tool after the stream stops has failed. */
	streaming?: boolean;
	/** For approval-responded: what the person answered. */
	approved?: boolean;
	/** For output-available: the output is a preliminary (streamed) result. */
	preliminary?: boolean;
}

export function getToolName(part: ToolMessagePart) {
	return part.type === "dynamic-tool" ? part.toolName : part.type.slice("tool-".length);
}

/** "get_doctype_schema" -> "get doctype schema". */
export function humanizeToolName(name: string) {
	return name.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase().trim();
}

/** A lucide icon for a tool, guessed from its name; the wrench is the fallback. */
export function getToolIcon(name: string) {
	const rules: [RegExp, string][] = [
		[/skill|instruction|guide/, "lucide-book-open"],
		[/search|find|query|lookup/, "lucide-search"],
		[/delete|remove|drop/, "lucide-trash-2"],
		[/create|insert|add|new/, "lucide-plus"],
		[/update|edit|set|rename|patch/, "lucide-pencil"],
		[/schema|doctype|meta/, "lucide-database"],
		[/get|read|list|fetch|load/, "lucide-file-text"],
		[/run|exec|command|shell/, "lucide-square-terminal"],
	];
	return rules.find(([pattern]) => pattern.test(name.toLowerCase()))?.[1] ?? "lucide-wrench";
}

function isRunning(state: ToolState, context: ToolStateContext) {
	if (state === "input-streaming" || state === "input-available") return true;
	if (state === "approval-responded") return context.approved !== false;
	return state === "output-available" && !!context.preliminary;
}

/** The Trace line status for a tool state, as in shadcn's Tool states table. */
export function getToolStatus(state: ToolState, context: ToolStateContext = {}): TraceStatus | undefined {
	const streaming = context.streaming ?? true;
	if (state === "output-error") return "error";
	if (isRunning(state, context)) return streaming ? "running" : "error";
	return undefined;
}

export function getToolTitle(state: ToolState, name: string, context: ToolStateContext = {}) {
	const streaming = context.streaming ?? true;
	if (state === "output-denied" || (state === "approval-responded" && context.approved === false)) return `Denied ${name}`;
	if (state === "approval-requested") return `Waiting for approval to ${name}`;
	if (state === "output-error") return `Failed to ${name}`;
	if (isRunning(state, context)) return streaming ? `Running ${name}` : `Failed to ${name}`;
	return `Ran ${name}`;
}

export function getStatusBadge(state: ToolState, context: ToolStateContext = {}): { label: string; theme: BadgeTheme } {
	const streaming = context.streaming ?? true;
	if (state === "output-error") return { label: "Error", theme: "red" };
	if (state === "output-denied" || (state === "approval-responded" && context.approved === false)) {
		return { label: "Denied", theme: "gray" };
	}
	if (state === "approval-requested") return { label: "Needs approval", theme: "amber" };
	if (isRunning(state, context) && !streaming) return { label: "Stopped", theme: "red" };
	if (state === "input-streaming") return { label: "Preparing", theme: "gray" };
	if (isRunning(state, context)) return { label: "Running", theme: "blue" };
	return { label: "Done", theme: "green" };
}

/** Pulls readable text out of a tool output; MCP results arrive as `{ content: [{ type: "text", text }] }`. */
export function formatToolOutput(output: unknown): { code: string; language: string; isError: boolean } {
	const isError = isRecord(output) && output.isError === true;
	if (typeof output === "string") return { ...prettyText(output), isError };
	const texts = mcpTexts(output);
	if (texts) return { ...prettyText(texts), isError };
	return { code: JSON.stringify(output, null, 2) ?? "", language: "json", isError };
}

export function formatToolInput(input: unknown) {
	if (input === undefined) return "";
	return typeof input === "string" ? input : JSON.stringify(input, null, 2);
}

function mcpTexts(output: unknown) {
	if (!isRecord(output) || !Array.isArray(output.content)) return null;
	const texts = output.content.filter((item) => isRecord(item) && item.type === "text").map((item) => String(item.text));
	return texts.length ? texts.join("\n\n") : null;
}

function prettyText(text: string) {
	try {
		return { code: JSON.stringify(JSON.parse(text), null, 2), language: "json" };
	} catch {
		return { code: text, language: "text" };
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}
