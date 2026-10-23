<script setup lang="ts">
import { toRef } from "vue";
import { Trace, TraceCollapsible } from "../trace";
import { providePlanStreaming } from "./context";

/** The steps the agent plans to take, and how far it has got. */
const props = withDefaults(defineProps<{ isStreaming?: boolean; defaultOpen?: boolean }>(), { defaultOpen: true });
const open = defineModel<boolean | undefined>("open", { default: undefined });
providePlanStreaming(toRef(() => props.isStreaming));
</script>

<template>
	<Trace data-slot="plan">
		<TraceCollapsible v-model:open="open" :default-open="defaultOpen"><slot /></TraceCollapsible>
	</Trace>
</template>
