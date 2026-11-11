<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle } from "../code-block";
import CitationCard from "../inline-citation/CitationCard.vue";
import { citationKey, type CitationIndex } from "../inline-citation/collect";
import type { CitationSource } from "../inline-citation/InlineCitation.vue";
import { MarkdownRenderer } from "./markdown";
import MermaidBlock from "./MermaidBlock.vue";

/**
 * Markdown for an assistant reply. Safe to re-render on every streamed chunk:
 * incomplete syntax is closed first, and finished blocks are cached.
 *
 * With `citations` (collect.ts), a link to one of those pages shows as a chip, and
 * hovering or focusing it opens a card with the page's title and an excerpt.
 */
const props = withDefaults(defineProps<{ content: string; parseIncomplete?: boolean; size?: "sm" | "base"; citations?: CitationIndex }>(), {
	parseIncomplete: true,
	size: "base",
});

const renderer = new MarkdownRenderer();
const blocks = computed(() =>
	renderer
		.render(props.content, props.parseIncomplete)
		.map((block) => (block.kind === "html" && props.citations?.size ? { ...block, html: markCitations(block.html) } : block)),
);

/** Tags each link to a cited page with its key. DOMPurify writes href first, quoted, with & as &amp;. */
function markCitations(html: string) {
	return html.replace(/<a href="([^"]*)"/g, (tag, href: string) => {
		const key = citationKey(href.replaceAll("&amp;", "&"));
		return props.citations?.has(key) ? `<a data-citation="${key.replaceAll('"', "&quot;")}" href="${href}"` : tag;
	});
}

const card = ref<{ source: CitationSource; anchor: DOMRect } | null>(null);
let hideTimer: ReturnType<typeof setTimeout> | undefined;

function showCard(event: Event) {
	const link = (event.target as Element | null)?.closest?.("a[data-citation]") as HTMLElement | null;
	const source = link && props.citations?.get(link.dataset.citation ?? "");
	if (!link || !source) return;
	clearTimeout(hideTimer);
	card.value = { source, anchor: link.getBoundingClientRect() };
}

function hideCard(event?: Event) {
	if (event && !(event.target as Element | null)?.closest?.("a[data-citation]")) return;
	clearTimeout(hideTimer);
	hideTimer = setTimeout(() => (card.value = null), 120);
}

// The card is fixed to the screen, so it closes when anything scrolls instead of floating away from its chip.
const closeCard = () => (card.value = null);
watch(
	() => Boolean(card.value),
	(open) => {
		if (open) window.addEventListener("scroll", closeCard, { capture: true, passive: true });
		else window.removeEventListener("scroll", closeCard, { capture: true });
	},
);

function keepCard() {
	clearTimeout(hideTimer);
}

onBeforeUnmount(() => {
	clearTimeout(hideTimer);
	window.removeEventListener("scroll", closeCard, { capture: true });
});
</script>

<template>
	<div
		data-slot="response"
		:data-size="size"
		@pointerover="showCard"
		@pointerout="hideCard"
		@focusin="showCard"
		@focusout="hideCard"
		class="prose prose-sm prose-p:tracking-normal prose-li:tracking-normal prose-blockquote:tracking-normal [--tw-prose-bullets:var(--ink-gray-6)] [--tw-prose-counters:var(--ink-gray-6)] min-w-0 max-w-none text-p-md text-ink-gray-8 data-[size=sm]:text-p-sm prose-headings:mb-2 prose-headings:mt-6 prose-headings:text-ink-gray-9 first:prose-headings:mt-0 prose-p:my-3 prose-blockquote:font-normal prose-blockquote:not-italic [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none prose-blockquote:text-ink-gray-7 prose-strong:font-semibold prose-code:rounded-2 prose-code:bg-surface-gray-2 prose-code:px-1 prose-code:py-px prose-code:text-[0.85em] prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-ol:my-3 prose-ul:my-3 prose-li:my-1 prose-table:my-3 prose-table:text-p-md prose-table:tracking-normal prose-table:w-auto prose-table:min-w-[50%] prose-th:py-1.5 prose-th:pr-6 prose-th:font-medium prose-td:py-1.5 prose-td:pr-6 [&_:is(td,th):last-child]:pr-0 prose-td:tabular-nums prose-th:text-p-md-medium prose-th:text-ink-gray-7 prose-thead:border-outline-gray-3 prose-hr:my-4 prose-hr:border-outline-gray-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>.contents:first-child>*:first-child]:mt-0 [&>.contents:last-child>*:last-child]:mb-0"
	>
		<template v-for="block in blocks" :key="block.key">
			<MermaidBlock v-if="block.kind === 'code' && block.language === 'mermaid'" class="not-prose my-3" :code="block.code" :complete="block.complete" />
			<CodeBlock v-else-if="block.kind === 'code'" class="not-prose my-3" size="sm">
				<CodeBlockHeader>
					<CodeBlockTitle icon="lucide-file-code">{{ block.language || "text" }}</CodeBlockTitle>
					<CodeBlockActions><CodeBlockCopyButton :value="block.code" /></CodeBlockActions>
				</CodeBlockHeader>
				<CodeBlockContent :code="block.code" :language="block.language" class="max-h-96" />
			</CodeBlock>
			<div v-else class="contents" v-html="block.html" />
		</template>
		<CitationCard v-if="card" :source="card.source" :anchor="card.anchor" @enter="keepCard" @leave="hideCard()" />
	</div>
</template>
