<script setup lang="ts">
import type { Component } from "vue";
import { TraceCollapsibleTrigger, TraceIcon, TraceLine, TraceTitle, type TraceStatus } from "../trace";

/** Present tense while running ("Updating the form"), past tense once done. */
defineProps<{ title: string; status?: TraceStatus; icon?: string | Component }>();
</script>

<template>
	<TraceCollapsibleTrigger>
		<TraceLine :status="status">
			<TraceIcon v-if="icon" :icon="icon" />
			<TraceTitle><slot>{{ title }}</slot></TraceTitle>
		</TraceLine>
	</TraceCollapsibleTrigger>
</template>
