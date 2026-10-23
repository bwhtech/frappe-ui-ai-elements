<script setup lang="ts">
import { computed } from "vue";
import { TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceIcon, TraceLine, TraceTitle } from "../trace";

export type QueueItemStatus = "pending" | "in_progress" | "completed";

/**
 * One todo. With a description it becomes a line that opens to show it.
 * `in_progress` shimmers only while `streaming`.
 */
const props = withDefaults(defineProps<{ status?: QueueItemStatus; description?: string; streaming?: boolean }>(), {
	status: "pending",
	streaming: true,
});

const icon = { pending: "lucide-circle", in_progress: "lucide-circle-dot", completed: "lucide-circle-check" };
const lineStatus = computed(() => (props.status === "in_progress" && props.streaming ? "running" : undefined));
</script>

<template>
	<TraceCollapsible v-if="description" data-slot="queue-item">
		<TraceCollapsibleTrigger>
			<TraceLine :status="lineStatus">
				<TraceIcon :icon="icon[status]" />
				<TraceTitle :class="status === 'completed' && 'line-through decoration-outline-gray-3'"><slot /></TraceTitle>
			</TraceLine>
		</TraceCollapsibleTrigger>
		<TraceCollapsibleContent>{{ description }}</TraceCollapsibleContent>
	</TraceCollapsible>
	<TraceLine v-else :status="lineStatus" data-slot="queue-item">
		<TraceIcon :icon="icon[status]" />
		<TraceTitle :class="status === 'completed' && 'line-through decoration-outline-gray-3'"><slot /></TraceTitle>
	</TraceLine>
</template>
