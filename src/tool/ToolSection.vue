<script setup lang="ts">
import { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton } from "../code-block";

/** A labelled code panel inside ToolContent. */
defineProps<{ label: string; code: string; language?: string; destructive?: boolean }>();
</script>

<template>
	<section class="flex min-w-0 flex-col gap-1.5">
		<h4 class="text-xs-medium text-ink-gray-5">{{ label }}</h4>
		<CodeBlock size="sm" :variant="destructive ? 'destructive' : 'default'">
			<CodeBlockActions><CodeBlockCopyButton :value="code" /></CodeBlockActions>
			<CodeBlockContent :code="code" :language="language" wrap class="max-h-64" />
		</CodeBlock>
	</section>
</template>
