<script setup lang="ts">
import type { ToolUIPart } from "ai";
import { computed, ref, watch } from "vue";
import { ToolPart, type AskUserKind, type AskUserOutput } from "frappe-ui-ai-elements";
import { useLog } from "../log";
import type { Values } from "../types";
import { buildAskUserInput } from "./askUserSamples";

const props = defineProps<{ v: Values; worst: boolean }>();
const log = useLog();

const kinds = computed(() => [props.v.kind1, props.v.kind2, props.v.kind3, props.v.kind4].slice(0, Number(props.v.count)) as AskUserKind[]);
const input = computed(() =>
	buildAskUserInput({
		kinds: kinds.value,
		optionCount: Number(props.v.options),
		allowOther: Boolean(props.v.allowOther),
		required: Boolean(props.v.required),
		worst: props.worst,
	}),
);
const output = ref<AskUserOutput | null>(null);
const dismissed = ref(false);
// A new shape is a new call: start over.
const callId = ref(1);
watch(input, () => {
	output.value = null;
	dismissed.value = false;
	callId.value++;
});

const part = computed(
	() =>
		({
			type: "tool-ask_user",
			toolCallId: `call-ask-${callId.value}`,
			state: dismissed.value ? "output-error" : output.value && props.v.echo ? "output-available" : "input-available",
			input: input.value,
			output: output.value ?? undefined,
			errorText: dismissed.value ? "The person chose not to answer these questions." : undefined,
		}) as unknown as ToolUIPart,
);

// "Not now": the app closes the call with addToolOutput's output-error state.
function dismiss(toolCallId: string) {
	log("dismiss", { toolCallId });
	dismissed.value = true;
}

function answer(event: { toolCallId: string; output: AskUserOutput }) {
	log("answer", event);
	output.value = event.output;
}
</script>

<template>
	<div class="flex flex-col gap-3">
		<ToolPart :key="part.toolCallId" :part="part" :streaming="Boolean(v.streaming)" @answer="answer" @dismiss="dismiss" />
		<button
			v-if="output || dismissed"
			type="button"
			class="w-fit text-sm text-ink-gray-5 underline underline-offset-2 hover:text-ink-gray-8"
			@click="
				output = null;
				dismissed = false;
				callId++;
			"
		>
			Ask again
		</button>
	</div>
</template>
