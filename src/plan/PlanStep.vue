<script setup lang="ts">
import { computed } from "vue";
import { TraceIcon, TraceLine, TraceTitle } from "../trace";
import { usePlanStreaming } from "./context";

/** One step. `active` shimmers only while the plan streams. */
const props = withDefaults(defineProps<{ status?: "complete" | "active" | "pending" }>(), { status: "pending" });
const streaming = usePlanStreaming();

const icon = { complete: "lucide-circle-check", active: "lucide-circle-dot", pending: "lucide-circle" };
const lineStatus = computed(() => {
	if (props.status === "pending") return "pending";
	return props.status === "active" && streaming?.value !== false ? "running" : undefined;
});
</script>

<template>
	<TraceLine :status="lineStatus" data-slot="plan-step">
		<TraceIcon :icon="icon[status]" :class="status === 'complete' && 'text-ink-green-6'" />
		<TraceTitle><slot /></TraceTitle>
	</TraceLine>
</template>
