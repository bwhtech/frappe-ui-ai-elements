<script setup lang="ts">
import { Spinner } from "frappe-ui";
import { computed } from "vue";
import { TraceCollapsibleTrigger, TraceIcon, TraceLine, TraceTitle } from "../trace";
import { useReasoning } from "./context";

/** "Thinking" with a shimmer while it streams, then "Thought for Ns". The slot overrides the title. */
const { isStreaming, duration } = useReasoning();

const title = computed(() => {
	if (isStreaming.value) return "Thinking";
	if (duration.value === undefined) return "Thought for a few seconds";
	return `Thought for ${duration.value}s`;
});
</script>

<template>
	<TraceCollapsibleTrigger data-slot="reasoning-trigger">
		<TraceLine :status="isStreaming ? 'running' : undefined">
			<TraceIcon>
				<Spinner v-if="isStreaming" class="size-3.5" />
				<span v-else class="lucide-brain size-4" />
			</TraceIcon>
			<TraceTitle><slot :is-streaming="isStreaming" :duration="duration">{{ title }}</slot></TraceTitle>
		</TraceLine>
	</TraceCollapsibleTrigger>
</template>
