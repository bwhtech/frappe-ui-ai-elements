<script setup lang="ts">
import { computed } from "vue";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "frappe-ui-ai-elements";
import { useLog } from "../log";
import type { Values } from "../types";
import { worst as w } from "../worst";

const props = defineProps<{ v: Values; worst: boolean }>();
const log = useLog();
const base =
	"The person wants to **track volunteers**. Before creating anything I should check whether a Volunteer or Member DocType already exists, so I do not make a duplicate.";
const text = computed(() => {
	if (props.worst) return `${w.hindi}\n\n${w.unbroken}\n\n${w.marathi} ${w.emoji}`;
	const repeat = { short: 1, medium: 3, long: 10 }[String(props.v.length)] ?? 1;
	return Array.from({ length: repeat }, () => base).join("\n\n");
});
</script>

<template>
	<Reasoning
		:key="String(v.defaultOpen)"
		:is-streaming="Boolean(v.streaming)"
		:duration="Number(v.duration) || undefined"
		:default-open="Boolean(v.defaultOpen)"
		@update:open="log('update:open', $event)"
	>
		<ReasoningTrigger />
		<ReasoningContent v-if="v.length !== 'empty'" :content="text" />
	</Reasoning>
</template>
