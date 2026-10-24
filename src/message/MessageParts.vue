<script setup lang="ts">
import type { ReasoningUIPart, SourceUrlUIPart, UIMessage } from "ai";
import { computed } from "vue";
import Attachment from "../attachment/Attachment.vue";
import ConfirmationBatch from "../confirmation/ConfirmationBatch.vue";
import ReasoningPart from "../reasoning/ReasoningPart.vue";
import { UPDATE_PLAN_TOOL, type ProposePlanOutput, type UpdatePlanInput } from "../plan/build-plan";
import { useBuildPlan } from "../plan/context";
import PlanItemSteps from "../plan/PlanItemSteps.vue";
import type { AskUserOutput } from "../questionnaire/ask-user";
import Response from "../response/Response.vue";
import Sources from "../sources/Sources.vue";
import ToolPart from "../tool/ToolPart.vue";
import type { ToolMessagePart } from "../tool/state";
import { useMessageRole } from "./context";

/**
 * AI SDK adapter: renders every part of one UIMessage in order. Runs of
 * reasoning and tool parts sit together as steps; sources collect at the end.
 * With an approved build plan (provideBuildPlan), the steps for each plan item
 * sit under one line with the item's status, and update_plan calls are not shown.
 */
const props = withDefaults(defineProps<{ message: UIMessage; streaming?: boolean }>(), { streaming: false });
const emit = defineEmits<{
	approve: [approvalId: string];
	deny: [approvalId: string];
	/** The person answered an `ask_user` call: `addToolOutput({ tool: "ask_user", toolCallId, output })`. */
	answer: [answer: { toolCallId: string; output: AskUserOutput }];
	/** The person dismissed an `ask_user` call: `addToolOutput({ tool: "ask_user", toolCallId, state: "output-error", errorText })`. */
	dismiss: [toolCallId: string];
	/** The person decided on a `propose_plan` call: `addToolOutput({ tool: "propose_plan", toolCallId, output })`. */
	decide: [decision: { toolCallId: string; output: ProposePlanOutput }];
}>();

type Part = UIMessage["parts"][number];
type Group = { kind: "steps"; parts: Part[] } | { kind: "part"; part: Part } | { kind: "plan-item"; id: string; parts: Part[] };

const role = useMessageRole();
const buildPlan = useBuildPlan();
const sources = computed(() =>
	props.message.parts
		.filter((part): part is SourceUrlUIPart => part.type === "source-url")
		.filter((part, index, all) => all.findIndex((other) => other.url === part.url) === index),
);
const groups = computed(() => groupParts(props.message.parts));
/** Approval ids still waiting on the person; two or more get an "answer all" bar. */
const pendingApprovals = computed(() =>
	props.message.parts
		.map((part) => (isStep(part) && part.type !== "reasoning" ? asTool(part) : undefined))
		.filter((part) => part?.state === "approval-requested" && !part.approval.isAutomatic)
		.map((part) => (part as Extract<ToolMessagePart, { state: "approval-requested" }>).approval.id),
);
const firstPendingGroup = computed(() =>
	groups.value.findIndex((group) => group.kind !== "part" && group.parts.some((part) => isStep(part) && part.type !== "reasoning" && asTool(part).state === "approval-requested")),
);
const lastTextIndex = computed(() => props.message.parts.map((part) => part.type).lastIndexOf("text"));

function isStep(part: Part) {
	return part.type === "reasoning" || part.type === "dynamic-tool" || part.type.startsWith("tool-");
}

function groupParts(parts: Part[]): Group[] {
	const groups: Group[] = [];
	const grouping = buildPlan?.value?.decision === "approved";
	// The plan item the agent is working on: its steps go in its section.
	let current: string | null = null;
	for (const part of parts) {
		const last = groups[groups.length - 1];
		if (grouping && part.type === `tool-${UPDATE_PLAN_TOOL}` && asTool(part).state === "output-available") {
			for (const update of (asTool(part).input as UpdatePlanInput | undefined)?.updates ?? []) {
				if (update.status === "in_progress") current = update.id;
				else if (update.id === current) current = null;
			}
			continue;
		}
		if (isStep(part) && current && last?.kind === "plan-item" && last.id === current) last.parts.push(part);
		else if (isStep(part) && current) groups.push({ kind: "plan-item", id: current, parts: [part] });
		else if (isStep(part) && last?.kind === "steps") last.parts.push(part);
		else if (isStep(part)) groups.push({ kind: "steps", parts: [part] });
		else if (part.type === "text" || part.type === "file") groups.push({ kind: "part", part });
	}
	return groups;
}

function answerAll(approved: boolean) {
	for (const id of pendingApprovals.value) {
		if (approved) emit("approve", id);
		else emit("deny", id);
	}
}

/** A plan item's steps go under its line (PlanItemSteps); other steps sit in a plain column. */
function stepsAttrs(group: Exclude<Group, { kind: "part" }>) {
	if (group.kind === "steps") return { "data-slot": "message-steps", class: "flex min-w-0 flex-col gap-1.5" };
	const item = buildPlan?.value?.items.find((candidate) => candidate.id === group.id);
	return {
		title: item?.title ?? group.id,
		status: item?.status ?? "pending",
		count: group.parts.filter((part) => part.type !== "reasoning").length,
		streaming: props.streaming,
	};
}

function asTool(part: Part) {
	return part as ToolMessagePart;
}

function isReasoningStreaming(part: ReasoningUIPart) {
	return props.streaming && part.state === "streaming";
}

function isStreamingText(part: Part) {
	return props.streaming && props.message.parts.indexOf(part) === lastTextIndex.value;
}
</script>

<template>
	<template v-for="(group, index) in groups" :key="index">
		<ConfirmationBatch
			v-if="index === firstPendingGroup && pendingApprovals.length > 1"
			:count="pendingApprovals.length"
			:disabled="streaming"
			@approve="answerAll(true)"
			@deny="answerAll(false)"
		/>
		<component :is="group.kind === 'plan-item' ? PlanItemSteps : 'div'" v-if="group.kind !== 'part'" v-bind="stepsAttrs(group)">
			<template v-for="(part, stepIndex) in group.parts" :key="stepIndex">
				<ReasoningPart v-if="part.type === 'reasoning'" :text="part.text" :streaming="isReasoningStreaming(part)" />
				<ToolPart
					v-else
					:part="asTool(part)"
					:streaming="streaming"
					@approve="emit('approve', $event)"
					@deny="emit('deny', $event)"
					@answer="emit('answer', $event)"
					@dismiss="emit('dismiss', $event)"
					@decide="emit('decide', $event)"
				/>
			</template>
		</component>
		<template v-else-if="group.part.type === 'text'">
			<span v-if="role === 'user'" class="whitespace-pre-wrap">{{ group.part.text }}</span>
			<Response v-else :content="group.part.text" :parse-incomplete="isStreamingText(group.part)" />
		</template>
		<Attachment
			v-else-if="group.part.type === 'file'"
			:name="group.part.filename ?? 'File'"
			:media-type="group.part.mediaType"
			:url="group.part.url"
		/>
	</template>
	<Sources v-if="sources.length" :sources="sources" />
</template>
