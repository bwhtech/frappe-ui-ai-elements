<script setup lang="ts">
import { Trace, TraceCollapsibleContent } from "../trace";
</script>

<template>
	<TraceCollapsibleContent class="flex flex-col gap-2.5">
		<p v-if="$slots.description" class="text-p-sm text-ink-gray-6"><slot name="description" /></p>
		<Trace><slot /></Trace>
		<div v-if="$slots.footer" data-slot="plan-footer" class="flex items-center gap-2 pt-1"><slot name="footer" /></div>
	</TraceCollapsibleContent>
</template>
