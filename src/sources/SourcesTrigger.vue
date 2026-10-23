<script setup lang="ts">
import { TraceCollapsibleTrigger, TraceIcon, TraceLine, TraceTitle } from "../trace";

defineProps<{ count: number }>();
</script>

<template>
	<TraceCollapsibleTrigger>
		<TraceLine>
			<TraceIcon icon="lucide-globe" />
			<TraceTitle><slot>Used {{ count }} {{ count === 1 ? "source" : "sources" }}</slot></TraceTitle>
		</TraceLine>
	</TraceCollapsibleTrigger>
</template>
