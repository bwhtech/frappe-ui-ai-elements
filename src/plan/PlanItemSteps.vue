<script setup lang="ts">
import { computed, ref } from "vue";
import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon, TraceLine, TraceTitle } from "../trace";
import type { BuildPlanStatus } from "./build-plan";

/**
 * The steps the agent took for one item of an approved plan, under one line with the
 * item's status. Open while the item is in progress, closed once it is finished,
 * unless the person opened or closed it themselves.
 */
const props = withDefaults(defineProps<{ title: string; status: BuildPlanStatus; count: number; streaming?: boolean }>(), { streaming: false });

const chosen = ref<boolean | undefined>(undefined);
const open = computed({ get: () => chosen.value ?? props.status === "in_progress", set: (value) => (chosen.value = value) });

const ICONS: Record<BuildPlanStatus, string> = {
	pending: "lucide-circle",
	in_progress: "lucide-circle-dot",
	done: "lucide-circle-check",
	skipped: "lucide-circle-slash",
};
</script>

<template>
	<TraceCollapsible v-model:open="open" data-slot="plan-item-steps" :data-status="status">
		<TraceCollapsibleTrigger>
			<TraceLine :status="status === 'in_progress' && streaming ? 'running' : undefined">
				<TraceIcon :icon="ICONS[status]" :class="status === 'done' && 'text-ink-green-6'" />
				<TraceTitle :class="status === 'skipped' && 'line-through'">{{ title }}</TraceTitle>
				<TraceDescription>{{ count }} {{ count === 1 ? "step" : "steps" }}</TraceDescription>
			</TraceLine>
		</TraceCollapsibleTrigger>
		<TraceCollapsibleContent keep-mounted>
			<Trace><slot /></Trace>
		</TraceCollapsibleContent>
	</TraceCollapsible>
</template>
