<script setup lang="ts">
import { Button, Textarea } from "frappe-ui";
import { computed, ref } from "vue";
import {
	BUILD_PLAN_KINDS,
	BUILD_PLAN_KIND_LABELS,
	planProgress,
	type BuildPlan,
	type BuildPlanStatus,
	type ProposePlanInput,
	type ProposePlanOutput,
} from "./build-plan";

/**
 * A ready-made card for a `propose_plan` tool call: what the agent will build, grouped
 * by kind. While it waits, the person approves the whole plan or asks for changes.
 * Once approved, pass `plan` (currentPlan) and its items tick off as the build goes.
 */
const props = withDefaults(
	defineProps<{
		input: ProposePlanInput;
		output?: ProposePlanOutput;
		/** The person wrote in chat instead of answering. */
		unanswered?: boolean;
		/** This plan with live statuses. Ignored when it is an older plan. */
		plan?: BuildPlan | null;
		/** The reply is still streaming: buttons wait, and the active item shimmers. */
		streaming?: boolean;
	}>(),
	{ streaming: false },
);
const emit = defineEmits<{ decide: [output: ProposePlanOutput] }>();

const changing = ref(false);
const feedback = ref("");
const decided = ref<ProposePlanOutput | null>(null);
const result = computed(() => props.output ?? decided.value);
const waiting = computed(() => !result.value && !props.unanswered);

const statusOf = (id: string): BuildPlanStatus => props.plan?.items.find((item) => item.id === id)?.status ?? "pending";
const noteOf = (id: string) => props.plan?.items.find((item) => item.id === id)?.note;
const groups = computed(() =>
	BUILD_PLAN_KINDS.map((kind) => ({ kind, label: BUILD_PLAN_KIND_LABELS[kind], items: props.input.items.filter((item) => item.kind === kind) })).filter(
		(group) => group.items.length,
	),
);
const progress = computed(() => (props.plan ? planProgress(props.plan) : null));
const finished = computed(() => !!progress.value && progress.value.finished === progress.value.total);

const status = computed(() => {
	if (waiting.value) return "Waiting for your approval";
	if (props.unanswered) return "Not approved";
	if (!result.value?.approved) return "Changes asked";
	if (!progress.value) return "Approved";
	return finished.value ? "Built" : `${progress.value.finished} of ${progress.value.total} done`;
});

const ICONS: Record<BuildPlanStatus, string> = {
	pending: "lucide-circle",
	in_progress: "lucide-circle-dot",
	done: "lucide-circle-check",
	skipped: "lucide-circle-slash",
};

function decide(output: ProposePlanOutput) {
	decided.value = output;
	emit("decide", output);
}

function sendChanges() {
	const text = feedback.value.trim();
	if (text) decide({ approved: false, feedback: text });
}
</script>

<template>
	<section
		data-slot="tool-plan"
		class="min-w-0 rounded-6 border border-outline-gray-2 bg-surface-base p-3 shadow-sm sm:p-4"
		:aria-label="`Plan: ${input.title}`"
	>
		<!-- The status sits beside the title, or under it when the card is narrow. -->
		<div class="flex min-w-0 items-start gap-2">
			<span class="lucide-list-checks mt-px size-4 shrink-0 text-ink-gray-5" aria-hidden="true" />
			<div class="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
				<p class="min-w-0 grow basis-60 text-sm-medium text-ink-gray-8 [overflow-wrap:anywhere]">{{ input.title }}</p>
				<span
					class="shrink-0 text-xs tabular-nums"
					:class="waiting ? 'text-ink-amber-6' : finished ? 'text-ink-green-6' : 'text-ink-gray-5'"
				>
					{{ status }}
				</span>
			</div>
		</div>

		<div class="mt-3 flex flex-col gap-3">
			<div v-for="group in groups" :key="group.kind" class="flex min-w-0 flex-col gap-1.5">
				<p class="text-xs-medium text-ink-gray-5">{{ group.label }}</p>
				<div
					v-for="item in group.items"
					:key="item.id"
					data-slot="plan-item"
					:data-status="statusOf(item.id)"
					class="flex min-w-0 items-start gap-2 data-[status=skipped]:opacity-60"
				>
					<span
						:class="[ICONS[statusOf(item.id)], 'mt-0.5 size-4 shrink-0', statusOf(item.id) === 'done' ? 'text-ink-green-6' : 'text-ink-gray-5']"
						aria-hidden="true"
					/>
					<div class="min-w-0 flex-1">
						<p
							class="text-p-sm text-ink-gray-8 [overflow-wrap:anywhere]"
							:class="{ shimmer: statusOf(item.id) === 'in_progress' && streaming, 'line-through': statusOf(item.id) === 'skipped' }"
						>
							{{ item.title }}
						</p>
						<p v-if="item.detail" class="text-p-xs text-ink-gray-5 [overflow-wrap:anywhere]">{{ item.detail }}</p>
						<p v-if="noteOf(item.id)" class="text-p-xs text-ink-gray-5 [overflow-wrap:anywhere]">Skipped: {{ noteOf(item.id) }}</p>
					</div>
				</div>
			</div>
		</div>

		<p v-if="result && !result.approved && result.feedback" class="mt-3 text-p-sm text-ink-gray-6">
			<span class="text-ink-gray-8">You asked for changes:</span> {{ result.feedback }}
		</p>

		<div v-if="waiting" class="mt-4 flex flex-col gap-2">
			<template v-if="changing">
				<Textarea v-model="feedback" placeholder="What should change? e.g. Leave out the dashboard" :rows="2" autofocus />
				<div class="flex justify-end gap-2">
					<Button variant="ghost" label="Cancel" @click="changing = false" />
					<Button variant="solid" label="Send changes" :disabled="streaming || !feedback.trim()" @click="sendChanges" />
				</div>
			</template>
			<div v-else class="flex flex-wrap items-center justify-end gap-2">
				<p v-if="streaming" class="mr-auto text-p-sm text-ink-gray-5">Waiting for the reply to finish…</p>
				<Button label="Request changes" :disabled="streaming" @click="changing = true" />
				<Button variant="solid" label="Approve and build" :disabled="streaming" @click="decide({ approved: true })" />
			</div>
		</div>
	</section>
</template>
