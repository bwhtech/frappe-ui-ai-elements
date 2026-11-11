<script setup lang="ts">
import type { DynamicToolUIPart } from "ai";
import { computed } from "vue";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput, ToolPart, type ToolState } from "frappe-ui-ai-elements";
import { useLog } from "../log";
import type { Values } from "../types";
import { hugeJson, worst as w } from "../worst";

const props = defineProps<{ v: Values; worst: boolean }>();
const log = useLog();

const state = computed(() => props.v.state as ToolState);
const name = computed(() => (props.worst ? w.toolName : String(props.v.toolName)));
const long = computed(() => props.worst || Boolean(props.v.long));
const input = computed(() => (long.value ? hugeJson(props.worst ? 40 : 12) : { doctype: "Volunteer", fields: ["full_name", "phone", "area"] }));
const output = computed(() => ({ content: [{ type: "text", text: JSON.stringify(long.value ? hugeJson(props.worst ? 40 : 12) : { name: "Volunteer", modified: "2026-10-23 18:02:11" }) }] }));
const errorText = computed(() => (props.worst ? `${w.unbroken} ${w.hindi}` : String(props.v.errorText)));

// The same state as an AI SDK part, for the ToolPart adapter.
const part = computed(() => {
	const approved = state.value === "approval-responded" ? props.v.approved === true : state.value === "output-denied" ? false : true;
	const approval = state.value === "input-streaming" || state.value === "input-available" ? undefined : { id: "approval-1", approved: state.value === "approval-requested" ? undefined : approved };
	return {
		type: "dynamic-tool",
		toolName: name.value,
		toolCallId: "call-1",
		state: state.value,
		input: input.value,
		output: state.value === "output-available" ? output.value : undefined,
		errorText: state.value === "output-error" ? errorText.value : undefined,
		approval,
	} as DynamicToolUIPart;
});
</script>

<template>
	<ToolPart
		v-if="v.adapter"
		:key="state"
		:part="part"
		:streaming="Boolean(v.streaming)"
		@approve="log('approve', $event)"
		@deny="log('deny', $event)"
	/>
	<Tool v-else :key="`${state}-${v.defaultOpen}`" :default-open="Boolean(v.defaultOpen)" @update:open="log('update:open', $event)">
		<ToolHeader
			:state="state"
			:tool-name="name"
			:streaming="Boolean(v.streaming)"
			:approved="state === 'approval-responded' ? Boolean(v.approved) : undefined"
			:show-badge="Boolean(v.badge)"
		/>
		<ToolContent>
			<ToolInput :input="input" />
			<ToolOutput :output="state === 'output-available' ? output : undefined" :error-text="state === 'output-error' ? errorText : undefined" />
		</ToolContent>
	</Tool>
</template>
