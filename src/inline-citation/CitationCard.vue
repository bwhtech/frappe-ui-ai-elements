<script setup lang="ts">
import { computed } from "vue";
import type { CitationSource } from "./InlineCitation.vue";

/**
 * The card for a citation chip in a reply (Response): the page's title, its site and an
 * excerpt. One card per reply, placed above the chip it belongs to, or below it near the
 * top of the screen. It stays open while the pointer is over it, so its link can be clicked.
 */
const props = defineProps<{ source: CitationSource; anchor: DOMRect }>();
const emit = defineEmits<{ enter: []; leave: [] }>();

const CARD_WIDTH = 288;
const below = computed(() => props.anchor.top < 180);
const style = computed(() => ({
	left: `${Math.max(8, Math.min(props.anchor.left + props.anchor.width / 2 - CARD_WIDTH / 2, innerWidth - CARD_WIDTH - 8))}px`,
	top: below.value ? `${props.anchor.bottom + 6}px` : `${props.anchor.top - 6}px`,
	transform: below.value ? "none" : "translateY(-100%)",
	width: `${CARD_WIDTH}px`,
}));
const host = computed(() => {
	try {
		return new URL(props.source.url).hostname.replace(/^www\./, "");
	} catch {
		return props.source.url;
	}
});
</script>

<template>
	<Teleport to="body">
		<div
			data-slot="citation-card"
			role="tooltip"
			class="fixed z-50 flex max-w-[calc(100vw-1rem)] flex-col gap-1 rounded-8 border border-outline-gray-2 bg-surface-elevation-2 px-3 py-2.5 shadow-lg"
			:style="style"
			@pointerenter="emit('enter')"
			@pointerleave="emit('leave')"
		>
			<p class="line-clamp-2 text-sm-medium text-ink-gray-8">{{ source.title || host }}</p>
			<a :href="source.url" target="_blank" rel="noreferrer" class="truncate text-xs text-ink-blue-link hover:underline">
				{{ host }}<span class="sr-only"> (opens in a new tab)</span>
			</a>
			<p v-if="source.description" class="line-clamp-4 text-p-xs text-ink-gray-6">{{ source.description }}</p>
		</div>
	</Teleport>
</template>
