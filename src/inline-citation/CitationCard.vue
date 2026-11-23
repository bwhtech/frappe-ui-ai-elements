<script setup lang="ts">
import { computed } from "vue";
import type { CitationSource } from "./InlineCitation.vue";

/**
 * The card for a citation in a reply (Response): the page's title, its site and an excerpt,
 * or a list of pages when one citation has several (`more`). One card per reply, placed above
 * the citation it belongs to, or below it near the top of the screen. It stays open while the
 * pointer is over it, so its links can be clicked.
 */
const props = defineProps<{ source: CitationSource; anchor: DOMRect; more?: CitationSource[] }>();
const emit = defineEmits<{ enter: []; leave: [] }>();

const CARD_WIDTH = 288;
const LIST_MAX_HEIGHT = 320;
const LIST_ROW_HEIGHT = 48;
const LIST_PADDING = 10;
const SCREEN_MARGIN = 14;
const sources = computed(() => [props.source, ...(props.more ?? [])]);
const isList = computed(() => sources.value.length > 1);
const roomAbove = computed(() => props.anchor.top - SCREEN_MARGIN);
const roomBelow = computed(() => innerHeight - props.anchor.bottom - SCREEN_MARGIN);
const listHeight = computed(() => Math.min(LIST_MAX_HEIGHT, sources.value.length * LIST_ROW_HEIGHT + LIST_PADDING));
const below = computed(() => (isList.value ? roomAbove.value < listHeight.value && roomBelow.value > roomAbove.value : props.anchor.top < 180));
const style = computed(() => ({
	left: `${Math.max(8, Math.min(props.anchor.left + props.anchor.width / 2 - CARD_WIDTH / 2, innerWidth - CARD_WIDTH - 8))}px`,
	top: below.value ? `${props.anchor.bottom + 6}px` : `${props.anchor.top - 6}px`,
	transform: below.value ? "none" : "translateY(-100%)",
	width: `${CARD_WIDTH}px`,
	maxHeight: isList.value ? `${Math.min(LIST_MAX_HEIGHT, below.value ? roomBelow.value : roomAbove.value)}px` : undefined,
}));

function hostname(url: string) {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
}
</script>

<template>
	<Teleport to="body">
		<div
			data-slot="citation-card"
			role="tooltip"
			class="fixed z-50 flex max-w-[calc(100vw-1rem)] flex-col rounded-8 border border-outline-gray-2 bg-surface-elevation-2 shadow-lg"
			:class="isList ? 'overflow-y-auto overscroll-contain p-1' : 'gap-1 px-3 py-2.5'"
			:style="style"
			@pointerenter="emit('enter')"
			@pointerleave="emit('leave')"
		>
			<template v-if="isList">
				<a
					v-for="item in sources"
					:key="item.url"
					:href="item.url"
					target="_blank"
					rel="noreferrer"
					class="flex shrink-0 flex-col justify-center gap-0.5 rounded-6 px-2 py-1.5 hover:bg-surface-gray-2 focus-visible:bg-surface-gray-2 focus-visible:outline-none [@media(pointer:coarse)]:min-h-11"
				>
					<span class="truncate text-sm-medium text-ink-gray-8">{{ item.title || hostname(item.url) }}</span>
					<span class="truncate text-xs text-ink-gray-6">{{ hostname(item.url) }}<span class="sr-only"> (opens in a new tab)</span></span>
				</a>
			</template>
			<template v-else>
				<p class="line-clamp-2 text-sm-medium text-ink-gray-8">{{ source.title || hostname(source.url) }}</p>
				<a :href="source.url" target="_blank" rel="noreferrer" class="truncate text-xs text-ink-blue-link hover:underline">
					{{ hostname(source.url) }}<span class="sr-only"> (opens in a new tab)</span>
				</a>
				<p v-if="source.description" class="line-clamp-4 text-p-xs text-ink-gray-6">{{ source.description }}</p>
			</template>
		</div>
	</Teleport>
</template>
