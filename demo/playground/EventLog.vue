<script setup lang="ts">
import { Button } from "frappe-ui";
import type { LogEntry } from "./log";

defineProps<{ entries: LogEntry[] }>();
defineEmits<{ clear: [] }>();

function format(payload: unknown) {
	if (payload === undefined) return "";
	const text = typeof payload === "string" ? payload : JSON.stringify(payload);
	return text.length > 160 ? `${text.slice(0, 160)}…` : text;
}
</script>

<template>
	<section class="rounded-6 border border-outline-gray-1 bg-surface-base" aria-label="Event log">
		<div class="flex items-center gap-2 border-b border-outline-gray-1 px-3 py-1.5">
			<span class="lucide-activity size-3.5 text-ink-gray-5" aria-hidden="true" />
			<h2 class="text-sm-medium text-ink-gray-7">Events</h2>
			<span class="text-xs text-ink-gray-4">{{ entries.length }}</span>
			<Button class="ml-auto" size="xs" variant="ghost" label="Clear" :disabled="!entries.length" @click="$emit('clear')" />
		</div>
		<ol class="max-h-36 overflow-y-auto px-3 py-2 font-mono text-xs" aria-live="polite">
			<li v-if="!entries.length" class="py-1 font-sans text-p-sm text-ink-gray-4">Interact with the preview. Emitted events show up here.</li>
			<li v-for="entry in entries" :key="entry.id" class="flex min-w-0 gap-2 py-0.5">
				<span class="shrink-0 text-ink-gray-4">{{ entry.time }}</span>
				<span class="shrink-0 text-ink-violet-6">{{ entry.name }}</span>
				<span class="min-w-0 truncate text-ink-gray-6">{{ format(entry.payload) }}</span>
			</li>
		</ol>
	</section>
</template>
