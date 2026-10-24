// The build plan: `propose_plan` lists what the agent will build and waits for the
// person; `update_plan` ticks items off while it builds. The server defines both tools
// and imports this file too, so the plan reads the same on both sides.

export const PROPOSE_PLAN_TOOL = "propose_plan";
export const UPDATE_PLAN_TOOL = "update_plan";

export type BuildPlanKind = "table" | "role" | "web_form" | "studio_page" | "records" | "other";
export type BuildPlanStatus = "pending" | "in_progress" | "done" | "skipped";

export interface BuildPlanItem {
	/** Unique in the plan. update_plan names items by it. */
	id: string;
	kind: BuildPlanKind;
	title: string;
	detail?: string;
}

export interface ProposePlanInput {
	title: string;
	items: BuildPlanItem[];
}

/** The person's answer to a plan. */
export interface ProposePlanOutput {
	approved: boolean;
	/** What to change, when not approved. */
	feedback?: string;
}

export interface BuildPlanUpdate {
	id: string;
	status: Exclude<BuildPlanStatus, "pending">;
	note?: string;
}

export interface UpdatePlanInput {
	updates: BuildPlanUpdate[];
}

/** The latest plan in a thread, with each item's status. */
export interface BuildPlan extends ProposePlanInput {
	toolCallId: string;
	/** waiting: on the person. changes: they asked for changes or wrote in chat instead. */
	decision: "waiting" | "approved" | "changes";
	feedback?: string;
	items: (BuildPlanItem & { status: BuildPlanStatus; note?: string })[];
}

export const BUILD_PLAN_KINDS: BuildPlanKind[] = ["table", "role", "web_form", "studio_page", "records", "other"];

/** Group labels, in the order the card shows them. */
export const BUILD_PLAN_KIND_LABELS: Record<BuildPlanKind, string> = {
	table: "Tables",
	role: "Roles",
	web_form: "Web forms",
	studio_page: "Studio pages",
	records: "Records",
	other: "Other",
};

export function parseProposePlanInput(input: unknown): ProposePlanInput | null {
	const value = input as Partial<ProposePlanInput> | undefined;
	if (!value || typeof value.title !== "string" || !Array.isArray(value.items)) return null;
	const items = value.items.filter((item) => item && typeof item.id === "string" && typeof item.title === "string" && BUILD_PLAN_KINDS.includes(item.kind));
	return items.length ? { title: value.title, items } : null;
}

export function parseProposePlanOutput(output: unknown): ProposePlanOutput | null {
	const value = output as Partial<ProposePlanOutput> | undefined;
	return value && typeof value.approved === "boolean" ? (value as ProposePlanOutput) : null;
}

type PartLike = { type: string; state?: string; toolCallId?: string; input?: unknown; output?: unknown };
type MessageLike = { role: string; parts: PartLike[] };

/**
 * The latest proposed plan and how far the build got: each successful update_plan
 * call after it changes its items. Null when the thread has no plan.
 */
export function currentPlan(messages: MessageLike[]): BuildPlan | null {
	let plan: BuildPlan | null = null;
	for (const part of messages.filter((m) => m.role === "assistant").flatMap((m) => m.parts)) {
		if (part.type === `tool-${PROPOSE_PLAN_TOOL}`) {
			const input = part.state === "input-streaming" ? null : parseProposePlanInput(part.input);
			if (!input) continue;
			const output = part.state === "output-available" ? parseProposePlanOutput(part.output) : null;
			plan = {
				...input,
				toolCallId: part.toolCallId!,
				decision: output?.approved ? "approved" : output || part.state === "output-error" ? "changes" : "waiting",
				feedback: output?.feedback,
				items: input.items.map((item) => ({ ...item, status: "pending" })),
			};
		} else if (part.type === `tool-${UPDATE_PLAN_TOOL}` && part.state === "output-available" && plan) {
			applyUpdates(plan, (part.input as UpdatePlanInput | undefined)?.updates ?? []);
		}
	}
	return plan;
}

/** Sets the status of the named items. Returns the ids the plan does not have. */
export function applyUpdates(plan: BuildPlan, updates: BuildPlanUpdate[]): string[] {
	const unknown: string[] = [];
	for (const update of updates) {
		const item = plan.items.find((candidate) => candidate.id === update.id);
		if (!item) unknown.push(update.id);
		else Object.assign(item, { status: update.status, note: update.note ?? item.note });
	}
	return unknown;
}

/** An approved plan with items left: the agent is building it. */
export function isBuilding(plan: BuildPlan | null): plan is BuildPlan {
	return plan?.decision === "approved" && plan.items.some((item) => item.status === "pending" || item.status === "in_progress");
}

/** "3 of 7 done", counting skipped items as finished. */
export function planProgress(plan: Pick<BuildPlan, "items">) {
	const finished = plan.items.filter((item) => item.status === "done" || item.status === "skipped").length;
	return { finished, total: plan.items.length };
}

/** A propose_plan call still waiting on the person, by tool call id. */
export function openPlanCalls(messages: MessageLike[]): string[] {
	return messages
		.filter((message) => message.role === "assistant")
		.flatMap((message) => message.parts)
		.filter((part) => part.type === `tool-${PROPOSE_PLAN_TOOL}` && (part.state === "input-available" || part.state === "input-streaming"))
		.map((part) => part.toolCallId as string);
}
