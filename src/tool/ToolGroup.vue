<script setup lang="ts">
import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon, TraceLine, TraceTitle } from "../trace";

/**
 * Two or more steps in a row under one line, such as "Looked up 4 things and made 2 changes".
 * A count of failed steps follows in gray, not red: the reply goes on without them.
 * Closed by default; the steps go in the slot. `running` shimmers the line while a step runs.
 */
defineProps<{ summary: string; failed?: number; running?: boolean }>();
const open = defineModel<boolean | undefined>("open", { default: undefined });
</script>

<template>
	<TraceCollapsible v-model:open="open" data-slot="tool-group">
		<TraceCollapsibleTrigger>
			<TraceLine :status="running ? 'running' : undefined">
				<TraceIcon icon="lucide-list-checks" />
				<TraceTitle :title="summary">{{ summary }}</TraceTitle>
				<TraceDescription v-if="failed" class="text-ink-gray-5">· {{ failed }} failed</TraceDescription>
			</TraceLine>
		</TraceCollapsibleTrigger>
		<TraceCollapsibleContent>
			<Trace><slot /></Trace>
		</TraceCollapsibleContent>
	</TraceCollapsible>
</template>
