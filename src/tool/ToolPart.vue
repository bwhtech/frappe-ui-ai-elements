<script setup lang="ts">
import { computed, type Component } from "vue";
import ToolConfirmation from "../confirmation/ToolConfirmation.vue";
import { parseProposePlanInput, parseProposePlanOutput, PROPOSE_PLAN_TOOL, UPDATE_PLAN_TOOL, type ProposePlanOutput, type UpdatePlanInput } from "../plan/build-plan";
import { useBuildPlan } from "../plan/context";
import ToolPlan from "../plan/ToolPlan.vue";
import { TraceIcon, TraceLine, TraceTitle } from "../trace";
import DeskCard from "../desk-card/DeskCard.vue";
import { parseShowInDeskInput, parseShowInDeskOutput, SHOW_IN_DESK_TOOL } from "../desk-card/show-in-desk";
import { ASK_USER_TOOL, parseAskUserInput, parseAskUserOutput, type AskUserOutput } from "../questionnaire/ask-user";
import ToolQuestionnaire from "../questionnaire/ToolQuestionnaire.vue";
import { useToolRenderers } from "./renderers";
import { getToolName, type ToolMessagePart } from "./state";
import Tool from "./Tool.vue";
import ToolContent from "./ToolContent.vue";
import ToolHeader from "./ToolHeader.vue";
import ToolInput from "./ToolInput.vue";
import ToolOutput from "./ToolOutput.vue";

/**
 * AI SDK adapter: renders one `tool-*` or `dynamic-tool` part. A pending
 * approval renders as a Confirmation; an `ask_user` call renders as a
 * Questionnaire (then its answers); a `show_in_desk` call renders as a DeskCard;
 * a `propose_plan` call renders as a plan card, and `update_plan` as one line per
 * item it ticked off; a tool the app draws itself (provideToolRenderers) renders
 * with its component; every other state is a Tool line.
 */
const props = withDefaults(defineProps<{ part: ToolMessagePart; streaming?: boolean; icon?: string | Component }>(), { streaming: true });
const emit = defineEmits<{
	approve: [approvalId: string];
	deny: [approvalId: string];
	/** The person answered an `ask_user` call. Pass it to the AI SDK's addToolOutput. */
	answer: [answer: { toolCallId: string; output: AskUserOutput }];
	/** The person dismissed an `ask_user` call. Close it with addToolOutput's `output-error` state. */
	dismiss: [toolCallId: string];
	/** The person approved a `propose_plan` call or asked for changes. Pass it to addToolOutput. */
	decide: [decision: { toolCallId: string; output: ProposePlanOutput }];
}>();

const name = computed(() => getToolName(props.part));
const renderers = useToolRenderers();
const custom = computed(() => renderers[name.value]);
const needsAnswer = computed(() => props.part.state === "approval-requested" && !props.part.approval.isAutomatic);
const approved = computed(() => props.part.approval?.approved);
const preliminary = computed(() => props.part.state === "output-available" && !!props.part.preliminary);
// ask_user: questions once the input is complete; answers once the output is in.
const questions = computed(() => {
	if (name.value !== ASK_USER_TOOL) return null;
	if (props.part.state !== "input-available" && props.part.state !== "output-available") return null;
	return parseAskUserInput(props.part.input);
});
// show_in_desk: a card while the server checks the target, then with its address.
const desk = computed(() => {
	if (name.value !== SHOW_IN_DESK_TOOL || props.part.state === "output-error" || props.part.state === "input-streaming") return null;
	const input = parseShowInDeskInput(props.part.input);
	if (!input) return null;
	const output = props.part.state === "output-available" ? parseShowInDeskOutput(props.part.output) : null;
	return { input, output };
});
// propose_plan: the card once the input is complete. Its items tick off from the thread's live plan.
const buildPlan = useBuildPlan();
const proposed = computed(() => {
	if (name.value !== PROPOSE_PLAN_TOOL || props.part.state === "input-streaming") return null;
	const input = parseProposePlanInput(props.part.input);
	if (!input) return null;
	const output = props.part.state === "output-available" ? (parseProposePlanOutput(props.part.output) ?? undefined) : undefined;
	const plan = buildPlan?.value?.toolCallId === props.part.toolCallId ? buildPlan.value : null;
	return { input, output, plan, unanswered: props.part.state === "output-error" };
});
// update_plan: what each update did, named by the plan's item titles.
const UPDATE_LABELS = { in_progress: "Started", done: "Done", skipped: "Skipped" } as const;
const UPDATE_ICONS = { in_progress: "lucide-circle-dot", done: "lucide-circle-check", skipped: "lucide-circle-slash" } as const;
const planUpdates = computed(() => {
	if (name.value !== UPDATE_PLAN_TOOL || props.part.state !== "output-available") return null;
	const updates = (props.part.input as UpdatePlanInput | undefined)?.updates ?? [];
	const titleOf = (id: string) => buildPlan?.value?.items.find((item) => item.id === id)?.title ?? id;
	return updates.map((update) => ({ ...update, title: titleOf(update.id) }));
});
const answers = computed(() => (props.part.state === "output-available" ? (parseAskUserOutput(props.part.output) ?? undefined) : undefined));

const askUserTitle = computed(() => {
	if (name.value !== ASK_USER_TOOL) return undefined;
	if (props.part.state === "input-streaming") return "Preparing questions";
	if (props.part.state === "output-error") return "Questions not answered";
	return undefined;
});

function answer(output: AskUserOutput) {
	emit("answer", { toolCallId: props.part.toolCallId, output });
}
</script>

<template>
	<ToolConfirmation
		v-if="needsAnswer && part.state === 'approval-requested'"
		:tool-name="name"
		:input="part.input"
		:reason="part.approval.requestReason"
		@approve="emit('approve', part.approval.id)"
		@deny="emit('deny', part.approval.id)"
	/>
	<component :is="custom" v-else-if="custom" :part="part" :streaming="streaming" />
	<ToolQuestionnaire
		v-else-if="questions && (part.state === 'input-available' || answers)"
		:key="part.toolCallId"
		:input="questions"
		:output="answers"
		:disabled="streaming"
		@answer="answer"
		@dismiss="emit('dismiss', part.toolCallId)"
	/>
	<ToolPlan
		v-else-if="proposed"
		:key="part.toolCallId"
		:input="proposed.input"
		:output="proposed.output"
		:plan="proposed.plan"
		:unanswered="proposed.unanswered"
		:streaming="streaming"
		@decide="emit('decide', { toolCallId: part.toolCallId, output: $event })"
	/>
	<div v-else-if="planUpdates" data-slot="plan-updates" class="flex min-w-0 flex-col gap-1.5">
		<TraceLine v-for="update in planUpdates" :key="update.id + update.status">
			<TraceIcon :icon="UPDATE_ICONS[update.status]" :class="update.status === 'done' && 'text-ink-green-6'" />
			<TraceTitle>{{ UPDATE_LABELS[update.status] }}: {{ update.title }}</TraceTitle>
		</TraceLine>
	</div>
	<DeskCard
		v-else-if="desk"
		:title="desk.input.title"
		:summary="desk.input.summary"
		:kind="desk.input.kind"
		:doctype="desk.input.kind === 'page' ? desk.input.route : desk.input.kind === 'studio' ? desk.output?.route : desk.input.doctype"
		:name="desk.input.name"
		:count="desk.output?.count"
		:url="desk.output?.url"
		:edit-url="desk.output?.editUrl"
	/>
	<Tool v-else>
		<ToolHeader
			:state="part.state"
			:tool-name="name"
			:title="askUserTitle"
			:icon="icon"
			:streaming="streaming"
			:approved="approved"
			:preliminary="preliminary"
		/>
		<ToolContent>
			<ToolInput :input="part.input" />
			<ToolOutput :output="part.output" :error-text="part.errorText" />
		</ToolContent>
	</Tool>
</template>
