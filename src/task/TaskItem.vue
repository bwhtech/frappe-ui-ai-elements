<script setup lang="ts">
import type { Component } from "vue";
import { TraceIcon, TraceLine, TraceTitle, type TraceStatus } from "../trace";

defineProps<{ status?: TraceStatus; icon?: string | Component }>();
</script>

<template>
	<TraceLine :status="status" data-slot="task-item">
		<TraceIcon v-if="icon" :icon="icon" />
		<TraceTitle><slot /></TraceTitle>
	</TraceLine>
</template>
