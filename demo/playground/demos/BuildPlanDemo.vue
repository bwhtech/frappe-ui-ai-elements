<script setup lang="ts">
import type { ToolUIPart } from "ai";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { provideBuildPlan, ToolPart, type BuildPlan, type BuildPlanStatus, type ProposePlanInput, type ProposePlanOutput } from "frappe-ui-ai-elements";
import { foodDrivePlan } from "../../gallery/fixtures";
import { useLog } from "../log";
import type { Values } from "../types";
import { worst as w } from "../worst";

type Stage = "waiting" | "building" | "built" | "changes" | "unanswered";

const props = defineProps<{ v: Values; worst: boolean }>();
const log = useLog();

const input = computed<ProposePlanInput>(() => ({
	title: props.worst ? w.name : foodDrivePlan.title,
	items: foodDrivePlan.items
		.slice(0, Number(props.v.count))
		.map((item, index) => (props.worst && index % 2 === 0 ? { ...item, title: `${w.name} ${w.emoji}`, detail: `${w.hindi} ${w.unbroken}` } : item)),
}));

const output = ref<ProposePlanOutput | null>(null);
const unanswered = ref(false);
const statuses = ref<BuildPlanStatus[]>([]);
const running = ref(false);
// A new shape is a new call: start over from the controls.
const callId = ref(1);
let timer: ReturnType<typeof setTimeout> | undefined;

watch(
	() => [props.v.stage, props.v.done, input.value] as const,
	() => reset(props.v.stage as Stage, Number(props.v.done)),
	{ immediate: true },
);
onBeforeUnmount(() => clearTimeout(timer));

function reset(stage: Stage, done: number) {
	clearTimeout(timer);
	running.value = false;
	callId.value++;
	const count = input.value.items.length;
	unanswered.value = stage === "unanswered";
	output.value = stage === "building" || stage === "built" ? { approved: true } : stage === "changes" ? { approved: false, feedback: "Leave out the dashboard for now." } : null;
	statuses.value = input.value.items.map((_, index) => {
		if (stage === "built" || index < Math.min(done, count)) return "done";
		return stage === "building" && index === done ? "in_progress" : "pending";
	});
}

const part = computed(
	() =>
		({
			type: "tool-propose_plan",
			toolCallId: `call-plan-${callId.value}`,
			state: unanswered.value ? "output-error" : output.value ? "output-available" : "input-available",
			input: input.value,
			output: output.value ?? undefined,
			errorText: unanswered.value ? "The person wrote in chat instead of approving the plan." : undefined,
		}) as unknown as ToolUIPart,
);

const plan = computed<BuildPlan | null>(() =>
	output.value?.approved
		? { ...input.value, toolCallId: part.value.toolCallId, decision: "approved", items: input.value.items.map((item, index) => ({ ...item, status: statuses.value[index] ?? "pending" })) }
		: null,
);
provideBuildPlan(plan);

function decide(event: { toolCallId: string; output: ProposePlanOutput }) {
	log("decide", event);
	output.value = event.output;
	if (event.output.approved) build();
}

/** A scripted build: each item goes in progress, then done. */
function build() {
	running.value = true;
	const step = () => {
		const index = statuses.value.findIndex((status) => status !== "done");
		if (index === -1) {
			running.value = false;
			log("built", { items: statuses.value.length });
			return;
		}
		statuses.value[index] = statuses.value[index] === "in_progress" ? "done" : "in_progress";
		timer = setTimeout(step, Number(props.v.speed));
	};
	step();
}
</script>

<template>
	<div class="flex flex-col gap-3">
		<ToolPart :key="part.toolCallId" :part="part" :streaming="Boolean(v.streaming) || running" @decide="decide" />
		<button
			v-if="output || unanswered"
			type="button"
			class="w-fit text-sm text-ink-gray-5 underline underline-offset-2 hover:text-ink-gray-8"
			@click="reset('waiting', 0)"
		>
			Propose again
		</button>
	</div>
</template>
