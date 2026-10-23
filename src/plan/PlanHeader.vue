<script setup lang="ts">
import type { Component } from "vue";
import { TraceCollapsibleTrigger, TraceIcon, TraceLine } from "../trace";
import { usePlanStreaming } from "./context";

/** The line that opens the plan. Buttons go in `#actions`, next to the trigger, not inside it. */
withDefaults(defineProps<{ icon?: string | Component }>(), { icon: "lucide-route" });
const streaming = usePlanStreaming();
</script>

<template>
	<div data-slot="plan-header" class="flex min-w-0 items-center gap-2">
		<TraceCollapsibleTrigger>
			<TraceLine :status="streaming ? 'running' : undefined">
				<TraceIcon :icon="icon" />
				<slot />
			</TraceLine>
		</TraceCollapsibleTrigger>
		<div v-if="$slots.actions" class="ml-auto flex shrink-0 items-center gap-1"><slot name="actions" /></div>
	</div>
</template>
