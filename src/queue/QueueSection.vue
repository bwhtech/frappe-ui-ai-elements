<script setup lang="ts">
import type { Component } from "vue";
import { TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceIcon, TraceLine, TraceTitle, Trace } from "../trace";

/** A labelled, collapsible group of todos, e.g. "2 to do". */
withDefaults(defineProps<{ label: string; icon?: string | Component; defaultOpen?: boolean }>(), { icon: "lucide-list-todo" });
</script>

<template>
	<TraceCollapsible :default-open="defaultOpen" data-slot="queue-section">
		<TraceCollapsibleTrigger>
			<TraceLine>
				<TraceIcon :icon="icon" />
				<TraceTitle>{{ label }}</TraceTitle>
			</TraceLine>
		</TraceCollapsibleTrigger>
		<TraceCollapsibleContent>
			<Trace><slot /></Trace>
		</TraceCollapsibleContent>
	</TraceCollapsible>
</template>
