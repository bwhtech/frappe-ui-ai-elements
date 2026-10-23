<script setup lang="ts">
import { Trace, TraceCollapsible } from "../trace";

/** One tool call as a collapsible trace line. Put ToolHeader and ToolContent inside. */
defineProps<{ defaultOpen?: boolean }>();
const open = defineModel<boolean | undefined>("open", { default: undefined });
</script>

<template>
	<Trace data-slot="tool">
		<TraceCollapsible v-model:open="open" :default-open="defaultOpen">
			<slot />
		</TraceCollapsible>
	</Trace>
</template>
