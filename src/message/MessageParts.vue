<script setup lang="ts">
import type { ReasoningUIPart, SourceUrlUIPart, UIMessage } from "ai";
import { computed } from "vue";
import Attachment from "../attachment/Attachment.vue";
import { useViewOnClick } from "../attachment/viewer";
import Bubble from "../bubble/Bubble.vue";
import BubbleContent from "../bubble/BubbleContent.vue";
import ConfirmationBatch from "../confirmation/ConfirmationBatch.vue";
import { collectCitations } from "../inline-citation/collect";
import ReasoningPart from "../reasoning/ReasoningPart.vue";
import { UPDATE_PLAN_TOOL, type ProposePlanOutput, type UpdatePlanInput } from "../plan/build-plan";
import { useBuildPlan } from "../plan/context";
import PlanItemSteps from "../plan/PlanItemSteps.vue";
import type { AskUserOutput } from "../questionnaire/ask-user";
import Response from "../response/Response.vue";
import Sources from "../sources/Sources.vue";
import ToolGroup from "../tool/ToolGroup.vue";
import ToolPart from "../tool/ToolPart.vue";
import { useToolLabels } from "../tool/labels";
import { useUnfoldableTools } from "../tool/renderers";
import type { ToolMessagePart } from "../tool/state";
import { foldSteps, summarizeSteps, type WorkItem } from "../tool/work-group";
import { useInBubble, useMessageRole } from "./context";

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
type FilePart = Extract<Part, { type: "file" }>;
type Group =
	| { kind: "steps"; parts: Part[] }
	| { kind: "part"; part: Part }
	| { kind: "files"; parts: FilePart[] }
	| { kind: "plan-item"; id: string; parts: Part[] };

const role = useMessageRole();
// Inside a MessageContent that already draws the bubble, the text goes in that bubble.
const inBubble = useInBubble();
const viewOnClick = useViewOnClick();
const customTools = useUnfoldableTools();
const labels = useToolLabels();
const buildPlan = useBuildPlan();
const sources = computed(() =>
	props.message.parts
		.filter((part): part is SourceUrlUIPart => part.type === "source-url")
		.filter((part, index, all) => all.findIndex((other) => other.url === part.url) === index),
);
const groups = computed(() => groupParts(props.message.parts));
/** Pages the reply's tools returned; links to them show as citation chips. */
const citations = computed(() => collectCitations(props.message));
/** Approval ids still waiting on the person; two or more get an "answer all" bar. */
const pendingApprovals = computed(() =>
	props.message.parts
		.map((part) => (isStep(part) && part.type !== "reasoning" ? asTool(part) : undefined))
		.filter((part) => part?.state === "approval-requested" && !part.approval.isAutomatic)
		.map((part) => (part as Extract<ToolMessagePart, { state: "approval-requested" }>).approval.id),
);
const firstPendingGroup = computed(() =>
	groups.value.findIndex(
		(group) => isStepsGroup(group) && group.parts.some((part) => isStep(part) && part.type !== "reasoning" && asTool(part).state === "approval-requested"),
	),
);
const lastTextIndex = computed(() => props.message.parts.map((part) => part.type).lastIndexOf("text"));

function isStep(part: Part) {
	return part.type === "reasoning" || part.type === "dynamic-tool" || part.type.startsWith("tool-");
}

function groupParts(parts: Part[]): Group[] {
	const result: Group[] = [];
	const grouping = buildPlan?.value?.decision === "approved";
	// The plan item the agent is working on: its steps go in its section.
	let current: string | null = null;
	for (const part of parts) {
		const last = result[result.length - 1];
		if (grouping && part.type === `tool-${UPDATE_PLAN_TOOL}` && asTool(part).state === "output-available") {
			for (const update of (asTool(part).input as UpdatePlanInput | undefined)?.updates ?? []) {
				if (update.status === "in_progress") current = update.id;
				else if (update.id === current) current = null;
			}
			continue;
		}
		if (isStep(part) && current && last?.kind === "plan-item" && last.id === current) last.parts.push(part);
		else if (isStep(part) && current) result.push({ kind: "plan-item", id: current, parts: [part] });
		else if (isStep(part) && last?.kind === "steps") last.parts.push(part);
		else if (isStep(part)) result.push({ kind: "steps", parts: [part] });
		else if (part.type === "file" && last?.kind === "files") last.parts.push(part);
		else if (part.type === "file") result.push({ kind: "files", parts: [part] });
		else if (part.type === "text") result.push({ kind: "part", part });
	}
	return result;
}

function isStepsGroup(group: Group): group is Extract<Group, { kind: "steps" | "plan-item" }> {
	return group.kind === "steps" || group.kind === "plan-item";
}

function isImage(part: FilePart) {
	return part.mediaType.startsWith("image/") && Boolean(part.url);
}

/** Folds a plain steps group; a plan item's steps already sit under its own line. */
function workItems(group: Extract<Group, { kind: "steps" | "plan-item" }>) {
	return group.kind === "steps" ? foldSteps(group.parts, customTools) : group.parts.map((part) => ({ kind: "one" as const, part }));
}

function answerAll(approved: boolean) {
	for (const id of pendingApprovals.value) {
		if (approved) emit("approve", id);
		else emit("deny", id);
	}
}

/** A plan item's steps go under its line (PlanItemSteps); other steps sit in a plain column. */
function stepsAttrs(group: Extract<Group, { kind: "steps" | "plan-item" }>) {
	if (group.kind === "steps")
		return {
			"data-slot": "message-steps",
			class: "flex min-w-0 flex-col gap-1 [@media(pointer:coarse)]:gap-3 [&:not(:first-child)]:mt-1.5 [&:not(:last-child)]:mb-1.5",
		};
	const item = buildPlan?.value?.items.find((candidate) => candidate.id === group.id);
	return {
		title: item?.title ?? group.id,
		status: item?.status ?? "pending",
		count: group.parts.filter((part) => part.type !== "reasoning").length,
		streaming: props.streaming,
	};
}

/**
 * Keys from part identity, not position: answering an approval folds it into the steps
 * before it, so rows shift, and a positional key would hand one call's card to another.
 * A tool part is its call id; other parts are their place in message.parts, which only grows.
 */
const partIndex = computed(() => new Map(props.message.parts.map((part, index) => [part, index])));

function partKey(part: Part) {
	if (part.type === "dynamic-tool" || part.type.startsWith("tool-")) return `tool:${asTool(part).toolCallId}`;
	return `${part.type}:${partIndex.value.get(part) ?? props.message.parts.indexOf(part)}`;
}

function groupKey(group: Group) {
	const first = group.kind === "part" ? group.part : group.parts[0];
	return `${group.kind}:${group.kind === "plan-item" ? `${group.id}:` : ""}${first ? partKey(first) : ""}`;
}

function itemKey(item: WorkItem) {
	return item.kind === "fold" ? `fold:${partKey(item.parts[0]!)}` : partKey(item.part);
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
	<template v-for="(group, index) in groups" :key="groupKey(group)">
		<ConfirmationBatch
			v-if="index === firstPendingGroup && pendingApprovals.length > 1"
			:count="pendingApprovals.length"
			:disabled="streaming"
			@approve="answerAll(true)"
			@deny="answerAll(false)"
		/>
		<component :is="group.kind === 'plan-item' ? PlanItemSteps : 'div'" v-if="isStepsGroup(group)" v-bind="stepsAttrs(group)">
			<template v-for="item in workItems(group)" :key="itemKey(item)">
				<ToolGroup v-if="item.kind === 'fold'" v-bind="summarizeSteps(item.parts, streaming, labels)">
					<template v-for="part in item.parts" :key="partKey(part)">
						<ReasoningPart v-if="part.type === 'reasoning'" :text="part.text" :streaming="isReasoningStreaming(part)" />
						<ToolPart v-else :part="asTool(part)" :streaming="streaming" />
					</template>
				</ToolGroup>
				<ReasoningPart v-else-if="item.part.type === 'reasoning'" :text="item.part.text" :streaming="isReasoningStreaming(item.part)" />
				<ToolPart
					v-else
					:part="asTool(item.part)"
					:streaming="streaming"
					@approve="emit('approve', $event)"
					@deny="emit('deny', $event)"
					@answer="emit('answer', $event)"
					@dismiss="emit('dismiss', $event)"
					@decide="emit('decide', $event)"
				/>
			</template>
		</component>
		<template v-else-if="group.kind === 'part' && group.part.type === 'text'">
			<span v-if="role === 'user' && inBubble" class="whitespace-pre-wrap">{{ group.part.text }}</span>
			<Bubble v-else-if="role === 'user'" align="end" variant="muted">
				<BubbleContent class="whitespace-pre-wrap">{{ group.part.text }}</BubbleContent>
			</Bubble>
			<Response v-else :content="group.part.text" :parse-incomplete="isStreamingText(group.part)" :citations="citations" />
		</template>
		<div v-else-if="group.kind === 'files'" data-slot="message-files" class="flex max-w-[85%] flex-wrap gap-2 group-data-[align=end]/message:justify-end">
			<template v-for="file in group.parts" :key="partKey(file)">
				<a
					v-if="isImage(file)"
					:href="file.url"
					target="_blank"
					rel="noreferrer noopener"
					@click="viewOnClick($event, { name: file.filename ?? 'Image', url: file.url, mediaType: file.mediaType })"
					class="block size-24 overflow-hidden rounded-6 border border-outline-gray-2 transition-transform duration-150 ease-out-strong active:scale-[0.97] motion-reduce:active:scale-100"
				>
					<img :src="file.url" :alt="file.filename ?? 'Image'" class="size-full object-cover" loading="lazy" />
				</a>
				<Attachment v-else :name="file.filename ?? 'File'" :media-type="file.mediaType" :url="file.url" />
			</template>
		</div>
	</template>
	<Sources v-if="sources.length" :sources="sources" />
</template>
