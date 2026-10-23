<script setup lang="ts">
import { Trace, TraceCollapsible } from "../trace";

/** A task and its steps. Keep the running task open; close each once it is done. */
withDefaults(defineProps<{ defaultOpen?: boolean }>(), { defaultOpen: true });
const open = defineModel<boolean | undefined>("open", { default: undefined });
</script>

<template>
	<Trace data-slot="task">
		<TraceCollapsible v-model:open="open" :default-open="defaultOpen"><slot /></TraceCollapsible>
	</Trace>
</template>
