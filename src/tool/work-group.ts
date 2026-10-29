import type { UIMessage } from "ai";
import { ASK_USER_TOOL } from "../questionnaire/ask-user";
import { PROPOSE_PLAN_TOOL, UPDATE_PLAN_TOOL } from "../plan/build-plan";
import { SHOW_IN_DESK_TOOL } from "../desk-card/show-in-desk";
import { getToolName, getToolStatus, type ToolMessagePart } from "./state";

type Part = UIMessage["parts"][number];

/** A run of steps: one step on its own, or two or more folded under one summary line. */
export type WorkItem = { kind: "one"; part: Part } | { kind: "fold"; parts: Part[] };

/** Tools that draw a card the person reads or answers. They never fold. */
const CARD_TOOLS = new Set([ASK_USER_TOOL, PROPOSE_PLAN_TOOL, UPDATE_PLAN_TOOL, SHOW_IN_DESK_TOOL]);
const MIN_FOLD = 2;

/**
 * Folds runs of plain steps (reasoning and tool lines) so a reply reads as its text and
 * cards, not a wall of tool calls. Cards, an app's own tool drawings (`custom`) and calls
 * that wait on the person stay outside a fold, so nothing to answer is ever hidden.
 */
export function foldSteps(parts: Part[], custom: Set<string>): WorkItem[] {
	const items: WorkItem[] = [];
	let run: Part[] = [];
	const flush = () => {
		if (run.length >= MIN_FOLD) items.push({ kind: "fold", parts: run });
		else items.push(...run.map((part) => ({ kind: "one" as const, part })));
		run = [];
	};
	for (const part of parts) {
		if (isFoldable(part, custom)) run.push(part);
		else {
			flush();
			items.push({ kind: "one", part });
		}
	}
	flush();
	return items;
}

/** "Looked up 4 things and made 2 changes", and whether a step failed or still runs. */
export function summarizeSteps(parts: Part[], streaming: boolean) {
	const tools = parts.filter((part) => part.type !== "reasoning") as ToolMessagePart[];
	const counts = { read: 0, write: 0, other: 0 };
	for (const tool of tools) counts[actionOf(getToolName(tool))]++;
	const labels = [
		counts.read && `looked up ${plural(counts.read, "thing")}`,
		counts.write && `made ${plural(counts.write, "change")}`,
		counts.other && `took ${plural(counts.other, "other step")}`,
	].filter(Boolean) as string[];
	if (!tools.length) labels.push(parts.length === 1 ? "thought" : `thought (×${parts.length})`);

	const statuses = tools.map((tool) => getToolStatus(tool.state, { streaming, approved: tool.approval?.approved }));
	const failed = statuses.filter((status) => status === "error").length;
	const running = statuses.includes("running") || (streaming && parts.some((part) => part.type === "reasoning" && part.state === "streaming"));
	return { summary: capitalize(joinLabels(labels)), failed, running };
}

function isFoldable(part: Part, custom: Set<string>) {
	if (part.type === "reasoning") return true;
	const tool = part as ToolMessagePart;
	const name = getToolName(tool);
	if (CARD_TOOLS.has(name) || custom.has(name)) return false;
	return !(tool.state === "approval-requested" && !tool.approval.isAutomatic);
}

function actionOf(name: string): "read" | "write" | "other" {
	if (/delete|remove|create|insert|add|new|update|edit|set|rename|patch|save|put|submit|cancel/.test(name)) return "write";
	if (/search|find|query|lookup|get|read|list|fetch|load|schema|count|recall/.test(name)) return "read";
	return "other";
}

function plural(count: number, noun: string) {
	return `${count} ${count === 1 ? noun : `${noun}s`}`;
}

function joinLabels(labels: string[]) {
	return labels.length < 2 ? (labels[0] ?? "") : `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

function capitalize(text: string) {
	return text.charAt(0).toUpperCase() + text.slice(1);
}
