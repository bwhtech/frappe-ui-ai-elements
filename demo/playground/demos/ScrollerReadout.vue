<script setup lang="ts">
import { useMessageScroller, useMessageScrollerVisibility } from "@bwhtech/frappe-ui-ai-elements";

/** Shows what useMessageScrollerVisibility reports. Must sit inside the MessageScrollerProvider. */
const visibility = useMessageScrollerVisibility();
const { scrollToMessage } = useMessageScroller();
</script>

<template>
	<section class="rounded-6 border border-outline-gray-1 bg-surface-base px-3 py-2.5" aria-label="Visibility">
		<h3 class="text-sm-medium text-ink-gray-8">useMessageScrollerVisibility()</h3>
		<dl class="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm" aria-live="polite">
			<dt class="text-ink-gray-5">Current turn</dt>
			<dd class="truncate font-mono text-ink-gray-8">{{ visibility.currentAnchorId ?? "—" }}</dd>
			<dt class="text-ink-gray-5">First visible</dt>
			<dd class="truncate font-mono text-ink-gray-8">{{ visibility.firstVisibleMessageId ?? "—" }}</dd>
			<dt class="text-ink-gray-5">Last visible</dt>
			<dd class="truncate font-mono text-ink-gray-8">{{ visibility.lastVisibleMessageId ?? "—" }}</dd>
			<dt class="text-ink-gray-5">Visible</dt>
			<dd class="flex min-w-0 flex-wrap gap-1">
				<button
					v-for="id in visibility.visibleMessageIds"
					:key="id"
					type="button"
					class="rounded-3 bg-surface-gray-2 px-1.5 font-mono text-xs leading-5 text-ink-gray-7 hover:bg-surface-gray-3 data-[current]:bg-surface-gray-7 data-[current]:text-ink-base"
					:data-current="id === visibility.currentAnchorId || undefined"
					:aria-label="`Scroll to ${id}`"
					@click="scrollToMessage(id, { align: 'start' })"
				>
					{{ id }}
				</button>
				<span v-if="!visibility.visibleMessageIds.length" class="text-ink-gray-4">none</span>
			</dd>
		</dl>
	</section>
</template>
