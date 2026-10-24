// The `ask_user` tool: the agent asks, the person answers in the browser.
// The server defines the tool without `execute`; the UI answers with addToolOutput.

import type { QuestionnaireSubmitPayload } from "./context";

export const ASK_USER_TOOL = "ask_user";

/** The type of question. It picks the control; it is not a colour. */
export type AskUserKind = "single" | "multiple" | "text" | "number" | "date" | "boolean";

export interface AskUserOption {
	value: string;
	label: string;
	description?: string;
}

export interface AskUserQuestion {
	/** Unique in the call. Keys the answer. */
	id: string;
	/** A short label for the step, e.g. "Fields". */
	header?: string;
	question: string;
	description?: string;
	kind: AskUserKind;
	/** Required for `single` and `multiple`. */
	options?: AskUserOption[];
	/** Adds an "Other…" free-text answer to `single` and `multiple`. */
	allowOther?: boolean;
	/** Defaults to true. An optional question can be skipped. */
	required?: boolean;
	placeholder?: string;
}

export interface AskUserInput {
	title?: string;
	questions: AskUserQuestion[];
}

/**
 * single: the option value, or the "Other" text. multiple: values plus the
 * "Other" text. text: string. number: number. date: "YYYY-MM-DD". boolean:
 * true / false. null: skipped or left empty.
 */
export type AskUserAnswer = string | string[] | number | boolean | null;

export interface AskUserOutput {
	/** One entry per question id. */
	answers: Record<string, AskUserAnswer>;
}

/** How a question is drawn: rows for short lists, a picker for long ones. */
export type AskUserControl = "rows" | "select" | "combobox" | "multiselect" | "text" | "number" | "date" | "boolean";

const KINDS: AskUserKind[] = ["single", "multiple", "text", "number", "date", "boolean"];
/** Up to this many options show as rows with shortcuts; more use a picker. */
export const ASK_USER_ROW_LIMIT = 6;
const SELECT_LIMIT = 12;

export function controlFor(question: AskUserQuestion): AskUserControl {
	const count = question.options?.length ?? 0;
	if (question.kind === "single") return count <= ASK_USER_ROW_LIMIT ? "rows" : count <= SELECT_LIMIT ? "select" : "combobox";
	if (question.kind === "multiple") return count <= ASK_USER_ROW_LIMIT ? "rows" : "multiselect";
	return question.kind;
}

export function isRequired(question: AskUserQuestion) {
	return question.required !== false;
}

/** Checks a tool input against the shape. Returns null when it does not match, so the caller can fall back. */
export function parseAskUserInput(input: unknown): AskUserInput | null {
	if (!isRecord(input) || !Array.isArray(input.questions) || input.questions.length === 0) return null;
	if (input.title !== undefined && typeof input.title !== "string") return null;
	const questions = input.questions.map(parseQuestion);
	if (questions.some((question) => !question)) return null;
	const ids = new Set(questions.map((question) => question!.id));
	if (ids.size !== questions.length) return null;
	return { title: input.title as string | undefined, questions: questions as AskUserQuestion[] };
}

function parseQuestion(value: unknown): AskUserQuestion | null {
	if (!isRecord(value)) return null;
	const { id, question, kind, options } = value;
	if (typeof id !== "string" || !id || typeof question !== "string" || !KINDS.includes(kind as AskUserKind)) return null;
	for (const key of ["header", "description", "placeholder"] as const) {
		if (value[key] !== undefined && typeof value[key] !== "string") return null;
	}
	const needsOptions = kind === "single" || kind === "multiple";
	const parsedOptions = Array.isArray(options) ? options.map(parseOption) : undefined;
	if (needsOptions && (!parsedOptions?.length || parsedOptions.some((option) => !option))) return null;
	return {
		id,
		question,
		kind: kind as AskUserKind,
		header: value.header as string | undefined,
		description: value.description as string | undefined,
		placeholder: value.placeholder as string | undefined,
		options: needsOptions ? (parsedOptions as AskUserOption[]) : undefined,
		allowOther: needsOptions && value.allowOther === true,
		required: value.required !== false,
	};
}

function parseOption(value: unknown): AskUserOption | null {
	if (!isRecord(value) || typeof value.value !== "string" || typeof value.label !== "string") return null;
	if (value.description !== undefined && typeof value.description !== "string") return null;
	return { value: value.value, label: value.label, description: value.description as string | undefined };
}

/** The tool output for a submitted questionnaire: every question id, null when skipped. */
export function toAskUserOutput(input: AskUserInput, payload: QuestionnaireSubmitPayload): AskUserOutput {
	const answers = Object.fromEntries(input.questions.map((question) => [question.id, normalize(question, payload.answers[question.id])]));
	return { answers };
}

function normalize(question: AskUserQuestion, value: unknown): AskUserAnswer {
	if (value === undefined || value === null || value === "") return null;
	if (question.kind === "number") return Number.isFinite(Number(value)) ? Number(value) : null;
	if (question.kind === "boolean") return value === true;
	if (Array.isArray(value)) {
		const entries = value.map((entry) => String(entry).trim()).filter(Boolean);
		return entries.length ? entries : null;
	}
	return typeof value === "string" ? value.trim() : String(value);
}

/** Reads a tool output back; anything unexpected reads as no answers. */
export function parseAskUserOutput(output: unknown): AskUserOutput | null {
	if (!isRecord(output) || !isRecord(output.answers)) return null;
	return { answers: output.answers as Record<string, AskUserAnswer> };
}

/** A short, human answer for the summary: option labels, "Yes" / "No", a formatted date. */
export function formatAskUserAnswer(question: AskUserQuestion, answer: AskUserAnswer | undefined) {
	if (answer === undefined || answer === null) return null;
	const label = (value: string) => question.options?.find((option) => option.value === value)?.label ?? value;
	if (Array.isArray(answer)) return answer.map(label).join(", ");
	if (typeof answer === "boolean") return answer ? "Yes" : "No";
	if (question.kind === "date" && typeof answer === "string") return formatDate(answer);
	return typeof answer === "string" ? label(answer) : String(answer);
}

function formatDate(value: string) {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!match) return value;
	const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
	return date.toLocaleDateString(undefined, { dateStyle: "medium" });
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * The `ask_user` calls still waiting on the person. Close each one before sending a new
 * message, or the model gets a tool call with no result and the thread breaks:
 * `addToolOutput({ tool: "ask_user", toolCallId, state: "output-error", errorText })`.
 */
export function openAskUserCalls(messages: { role: string; parts: { type: string; state?: string; toolCallId?: string }[] }[]): string[] {
	return messages
		.filter((message) => message.role === "assistant")
		.flatMap((message) => message.parts)
		.filter((part) => part.type === `tool-${ASK_USER_TOOL}` && (part.state === "input-available" || part.state === "input-streaming"))
		.map((part) => part.toolCallId as string);
}
