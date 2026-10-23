<script setup lang="ts">
import { computed, useSlots, type Component } from "vue";
import { TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon, TraceLine, TraceTitle } from "../trace";

/**
 * One step: "Searching for …" while active, "Searched for …" once complete.
 * Detail in the default slot (like search results) makes the step open up.
 */
const props = withDefaults(
	defineProps<{ label: string; description?: string; status?: "complete" | "active" | "pending" | "error"; icon?: string | Component }>(),
	{ status: "complete", icon: "lucide-circle-check" },
);
const slots = useSlots();

const lineStatus = computed(() => ({ complete: undefined, active: "running", pending: "pending", error: "error" } as const)[props.status]);
const iconName = computed(() => (props.status === "error" ? "lucide-circle-x" : props.icon));
</script>

<template>
	<TraceCollapsible v-if="slots.default" data-slot="chain-of-thought-step">
		<TraceCollapsibleTrigger>
			<TraceLine :status="lineStatus">
				<TraceIcon :icon="iconName" />
				<TraceTitle>{{ label }}</TraceTitle>
				<TraceDescription v-if="description">{{ description }}</TraceDescription>
			</TraceLine>
		</TraceCollapsibleTrigger>
		<TraceCollapsibleContent><slot /></TraceCollapsibleContent>
	</TraceCollapsible>
	<TraceLine v-else :status="lineStatus" data-slot="chain-of-thought-step">
		<TraceIcon :icon="iconName" />
		<TraceTitle>{{ label }}</TraceTitle>
		<TraceDescription v-if="description">{{ description }}</TraceDescription>
	</TraceLine>
</template>
