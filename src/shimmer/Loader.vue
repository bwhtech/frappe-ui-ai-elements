<script setup lang="ts">
import { TraceIcon, TraceLine, TraceTitle } from "../trace";

/**
 * A live "working on it" line: an icon and shimmering text, no spinner. It matches the
 * reasoning line ("Thinking" with the brain icon), so when the model starts to think in
 * the open, the line stays where it is. It has the trigger's height, on touch screens too: the trigger's larger
 * touch area is invisible and does not move the layout.
 */
withDefaults(defineProps<{ text?: string; icon?: string }>(), { text: "Thinking", icon: "lucide-brain" });
</script>

<template>
	<div data-slot="loader" role="status" aria-live="polite" class="flex w-fit min-w-0 max-w-full items-center">
		<TraceLine status="running">
			<TraceIcon :icon="icon" />
			<TraceTitle>{{ text }}</TraceTitle>
		</TraceLine>
	</div>
</template>
