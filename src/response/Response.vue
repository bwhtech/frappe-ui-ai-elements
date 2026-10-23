<script setup lang="ts">
import { computed } from "vue";
import { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle } from "../code-block";
import { MarkdownRenderer } from "./markdown";

/**
 * Markdown for an assistant reply. Safe to re-render on every streamed chunk:
 * incomplete syntax is closed first, and finished blocks are cached.
 */
const props = withDefaults(defineProps<{ content: string; parseIncomplete?: boolean; size?: "sm" | "base" }>(), {
	parseIncomplete: true,
	size: "base",
});

const renderer = new MarkdownRenderer();
const blocks = computed(() => renderer.render(props.content, props.parseIncomplete));
</script>

<template>
	<div
		data-slot="response"
		:data-size="size"
		class="prose prose-sm min-w-0 max-w-none text-p-base text-ink-gray-8 data-[size=sm]:text-p-sm prose-headings:mb-2 prose-headings:mt-4 prose-headings:text-ink-gray-9 first:prose-headings:mt-0 prose-p:my-2 prose-a:text-ink-blue-link prose-a:no-underline hover:prose-a:underline prose-blockquote:font-normal prose-blockquote:not-italic [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none prose-blockquote:text-ink-gray-7 prose-strong:font-semibold prose-code:rounded-2 prose-code:bg-surface-gray-2 prose-code:px-1 prose-code:py-px prose-code:text-[0.9em] prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-ol:my-2 prose-ul:my-2 prose-li:my-0.5 prose-table:my-3 prose-table:text-p-sm prose-th:text-ink-gray-7 prose-hr:my-4 prose-hr:border-outline-gray-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>.contents:first-child>*:first-child]:mt-0 [&>.contents:last-child>*:last-child]:mb-0"
	>
		<template v-for="block in blocks" :key="block.key">
			<CodeBlock v-if="block.kind === 'code'" class="not-prose my-3" size="sm">
				<CodeBlockHeader>
					<CodeBlockTitle icon="lucide-file-code">{{ block.language || "text" }}</CodeBlockTitle>
					<CodeBlockActions><CodeBlockCopyButton :value="block.code" /></CodeBlockActions>
				</CodeBlockHeader>
				<CodeBlockContent :code="block.code" :language="block.language" class="max-h-96" />
			</CodeBlock>
			<div v-else class="contents" v-html="block.html" />
		</template>
	</div>
</template>
