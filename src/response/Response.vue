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
 * With `citations` (collect.ts), a link to one of those pages gets a small raised number,
 * and hovering, focusing or tapping it opens a card with the page or pages it cites.
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

const NUMBER_LINK = String.raw`<a href="([^"]*)"((?:\s[\w-]+="[^"]*")*)>\[(\d{1,3})\]</a>`;
const NUMBER_LINKS = new RegExp(NUMBER_LINK, "g");
const NUMBER_RUNS = new RegExp(`${NUMBER_LINK}(?:\\s*${NUMBER_LINK})*`, "g");
const NAMED_LINKS = /<a href="([^"]*)"((?:\s[\w-]+="[^"]*")*)>(.*?)<\/a>/gs;

const pageKey = (href: string) => citationKey(href.replaceAll("&amp;", "&"));
const escapeAttribute = (value: string) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
const tile = (label: string | number) => `<span data-citation-tile>${label}</span>`;

/** Marks each link to a cited page. DOMPurify writes href first, every value double-quoted, with & as &amp;. */
function markCitations(html: string) {
	return html.replace(NUMBER_RUNS, markNumberRun).replace(NAMED_LINKS, markNamedLink);
}

/** Numbers side by side, like [1][2], become one link: each alone is too small a target to tap. */
function markNumberRun(run: string) {
	const links = [...run.matchAll(NUMBER_LINKS)];
	const numberByPage = new Map<string, string>();
	for (const [, href, , number] of links) {
		const key = pageKey(href!);
		if (!numberByPage.has(key)) numberByPage.set(key, number!);
	}
	if (![...numberByPage.keys()].every((key) => props.citations?.has(key))) return run;
	const numbers = [...numberByPage.values()];
	const shown = numbers.length > 3 ? [...numbers.slice(0, 2), `+${numbers.length - 2}`] : numbers;
	const label = numbers.length === 1 ? `Source ${numbers[0]}` : `${numbers.length} sources`;
	const [, href, attributes] = links[0]!;
	return `<a data-citation="${escapeAttribute([...numberByPage.keys()].join(" "))}" href="${href}"${attributes} aria-label="${label}">${shown.map(tile).join("")}</a>`;
}

function markNamedLink(link: string, href: string, attributes: string, text: string) {
	const key = pageKey(href);
	const number = props.citations?.get(key)?.number;
	if (!number || /^\[\d{1,3}\]$/.test(text)) return link;
	return `<a data-citation="${escapeAttribute(key)}" href="${href}"${attributes}>${text}${tile(number)}</a>`;
}

const card = ref<{ sources: CitationSource[]; anchor: DOMRect } | null>(null);
let hideTimer: ReturnType<typeof setTimeout> | undefined;

const citationLink = (event: Event) => (event.target as Element | null)?.closest?.("a[data-citation]") as HTMLElement | null | undefined;
const insideCard = (event: Event) => Boolean((event.target as Element | null)?.closest?.("[data-slot='citation-card']"));
const isTouch = (event: Event) => (event as PointerEvent).pointerType === "touch";

function showCard(event: Event) {
	const link = citationLink(event);
	const sources = (link?.dataset.citation ?? "").split(" ").flatMap((key) => props.citations?.get(key) ?? []);
	if (!link || sources.length === 0) return;
	clearTimeout(hideTimer);
	card.value = { sources, anchor: link.getBoundingClientRect() };
}

function hideCard(event?: Event) {
	if (event && !citationLink(event)) return;
	clearTimeout(hideTimer);
	hideTimer = setTimeout(() => (card.value = null), 120);
}

// A touch ends with pointerout, which would close the card as soon as it opened.
function showOnHover(event: Event) {
	if (!isTouch(event)) showCard(event);
}

function hideOnLeave(event: Event) {
	if (!isTouch(event)) hideCard(event);
}

function showOnTap(event: MouseEvent) {
	if (!citationLink(event) || !matchMedia("(pointer: coarse)").matches) return;
	event.preventDefault();
	showCard(event);
}

// The card is fixed to the screen, so it closes when the page scrolls instead of floating away from its link.
const closeOnScroll = (event: Event) => {
	if (!insideCard(event)) card.value = null;
};
const closeOnTapAway = (event: Event) => {
	if (!insideCard(event) && !citationLink(event)) card.value = null;
};
function stopWatchingCard() {
	window.removeEventListener("scroll", closeOnScroll, { capture: true });
	window.removeEventListener("pointerdown", closeOnTapAway, { capture: true });
}
watch(
	() => Boolean(card.value),
	(open) => {
		if (!open) return stopWatchingCard();
		window.addEventListener("scroll", closeOnScroll, { capture: true, passive: true });
		window.addEventListener("pointerdown", closeOnTapAway, { capture: true, passive: true });
	},
);

function keepCard() {
	clearTimeout(hideTimer);
}

onBeforeUnmount(() => {
	clearTimeout(hideTimer);
	stopWatchingCard();
});
</script>

<template>
	<div
		data-slot="response"
		:data-size="size"
		@pointerover="showOnHover"
		@pointerout="hideOnLeave"
		@click="showOnTap"
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
		<CitationCard v-if="card" :source="card.sources[0]!" :more="card.sources.slice(1)" :anchor="card.anchor" @enter="keepCard" @leave="hideCard()" />
	</div>
</template>
