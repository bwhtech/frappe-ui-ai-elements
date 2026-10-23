<script setup lang="ts">
import { computed, type Component } from "vue";
import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceIcon, TraceLine, TraceTitle, type TraceStatus } from "../trace";

/**
 * A summary line ("Researched in 3 steps") that opens into the steps.
 * It opens while `running` unless the person chose otherwise. Steps go in the default slot.
 */
const props = withDefaults(defineProps<{ title: string; status?: TraceStatus; running?: boolean; icon?: string | Component; defaultOpen?: boolean }>(), {
	icon: "lucide-sparkles",
});
const open = defineModel<boolean | undefined>("open", { default: undefined });
if (open.value === undefined && props.defaultOpen) open.value = true;
const effectiveOpen = computed(() => open.value ?? !!props.running);
</script>

<template>
	<Trace data-slot="chain-of-thought">
		<TraceCollapsible :open="effectiveOpen" @update:open="open = $event">
			<TraceCollapsibleTrigger>
				<TraceLine :status="running ? 'running' : status">
					<TraceIcon :icon="icon" />
					<TraceTitle>{{ title }}</TraceTitle>
				</TraceLine>
			</TraceCollapsibleTrigger>
			<TraceCollapsibleContent keep-mounted>
				<Trace><slot /></Trace>
			</TraceCollapsibleContent>
		</TraceCollapsible>
	</Trace>
</template>
