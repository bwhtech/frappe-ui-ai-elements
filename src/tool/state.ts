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

/**
 * A short line naming what a tool call acts on, for approval cards: the `doctype` and a
 * name-like value, looked for at the top level and in `data` / `doc`. Falls back to the
 * first two short text values. Empty when nothing fits.
 */
export function summarizeToolInput(input: unknown): string {
	if (!input || typeof input !== "object") return "";
	const record = input as Record<string, unknown>;
	const batch = docsOf(record) ?? docsOf(record.args) ?? docsOf(record.kwargs);
	if (batch?.length) {
		const types = [...new Set(batch.map((doc) => (doc as Record<string, unknown>)?.doctype).filter((type) => typeof type === "string"))];
		const what = types.length === 1 ? `${types[0]} records` : "records";
		return `${batch.length} ${batch.length === 1 ? what.replace(/s$/, "") : what}`;
	}
	const nested = [record.data, record.doc].find((value) => value && typeof value === "object" && !Array.isArray(value)) as
		| Record<string, unknown>
		| undefined;
	const scopes = [record, nested ?? {}];
	const pick = (keys: string[]) =>
		scopes.flatMap((scope) => keys.map((key) => scope[key])).find((value): value is string => typeof value === "string" && value.trim() !== "");

	const doctype = pick(["doctype", "doc_type"]);
	const name = pick(["title", "name", "full_name", "label"]) ?? firstNameLike(nested ?? record);
	const parts = [doctype, name].filter(Boolean) as string[];
	if (parts.length) return parts.join(" · ");

	return Object.values(record)
		.filter((value): value is string => typeof value === "string" && value.length <= 60)
		.slice(0, 2)
		.join(" · ");
}

/** The `docs` list of a bulk call such as frappe.client.insert_many, if this is one. */
function docsOf(value: unknown): unknown[] | undefined {
	if (!value || typeof value !== "object") return undefined;
	const docs = (value as Record<string, unknown>).docs;
	return Array.isArray(docs) ? docs : undefined;
}

function firstNameLike(scope: Record<string, unknown>) {
	const key = Object.keys(scope).find((key) => /(^|_)(name|title)$/.test(key) && typeof scope[key] === "string");
	return key ? (scope[key] as string) : undefined;
}
