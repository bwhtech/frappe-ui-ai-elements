<script setup lang="ts">
import { Button, HoverCard } from "frappe-ui";
import { computed } from "vue";

export interface CitationSource {
	url: string;
	title?: string;
	description?: string;
	quote?: string;
}

/**
 * Cited text with a source chip that opens on hover or focus. The chip shows the
 * first source's hostname, plus "+N" when there are more; the card lists them all.
 */
const props = defineProps<{ sources: CitationSource[] }>();

const first = computed(() => props.sources[0]);
const chip = computed(() => {
	const host = first.value ? hostname(first.value.url) : "source";
	return props.sources.length > 1 ? `${host} +${props.sources.length - 1}` : host;
});

function hostname(url: string) {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
}
</script>

<template>
	<span data-slot="inline-citation" class="inline">
		<slot />
		<HoverCard :hover-delay="10" :leave-delay="100" side="top">
			<template #trigger>
				<Button size="xs" variant="subtle" class="mx-0.5 inline-flex !h-5 rounded-full align-[1px] !text-xs">{{ chip }}</Button>
			</template>
			<div class="flex w-72 max-w-[calc(100vw-2rem)] flex-col divide-y divide-outline-gray-1 p-1">
				<div v-for="source in sources" :key="source.url" class="flex flex-col gap-1 px-2 py-2">
					<p class="text-sm-medium text-ink-gray-8">{{ source.title || hostname(source.url) }}</p>
					<a :href="source.url" target="_blank" rel="noreferrer" class="truncate text-xs text-ink-blue-link hover:underline">
						{{ hostname(source.url) }}<span class="sr-only"> (opens in a new tab)</span>
					</a>
					<p v-if="source.description" class="text-p-xs text-ink-gray-6">{{ source.description }}</p>
					<blockquote v-if="source.quote" class="border-l-2 border-outline-gray-2 pl-2 text-p-xs italic text-ink-gray-6">
						{{ source.quote }}
					</blockquote>
				</div>
			</div>
		</HoverCard>
	</span>
</template>
