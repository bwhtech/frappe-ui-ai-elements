<script setup lang="ts">
import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon, TraceLine, TraceTitle } from "../trace";

/**
 * Two or more steps in a row under one line, such as "Looked up 4 things and made 2 changes".
 * Closed by default; the steps go in the slot. `running` shimmers the line while a step runs.
 */
defineProps<{ summary: string; failed?: number; running?: boolean }>();
const open = defineModel<boolean | undefined>("open", { default: undefined });
</script>

<template>
	<TraceCollapsible v-model:open="open" data-slot="tool-group">
		<TraceCollapsibleTrigger>
			<TraceLine :status="running ? 'running' : undefined">
				<TraceIcon :icon="failed ? 'lucide-circle-alert' : 'lucide-list-checks'" :class="failed && 'text-ink-red-6'" />
				<TraceTitle :title="summary">{{ summary }}</TraceTitle>
				<TraceDescription v-if="failed" class="text-ink-red-6">{{ failed }} failed</TraceDescription>
			</TraceLine>
		</TraceCollapsibleTrigger>
		<TraceCollapsibleContent>
			<Trace><slot /></Trace>
		</TraceCollapsibleContent>
	</TraceCollapsible>
</template>
