<script setup lang="ts">
import { computed } from "vue";
import { formatToolOutput } from "./state";
import ToolSection from "./ToolSection.vue";

/** The tool result, or `errorText` when the call failed. MCP text content is unwrapped. */
const props = defineProps<{ output?: unknown; errorText?: string }>();

const result = computed(() => {
	if (props.errorText) return { code: props.errorText, language: "text", isError: true };
	if (props.output === undefined) return null;
	return formatToolOutput(props.output);
});
</script>

<template>
	<ToolSection
		v-if="result"
		data-slot="tool-output"
		:label="result.isError ? 'Error' : 'Result'"
		:code="result.code"
		:language="result.language"
		:destructive="result.isError"
	/>
</template>
