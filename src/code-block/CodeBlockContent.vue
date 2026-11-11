<script setup lang="ts">
import { computed } from "vue";
import { highlightLines } from "./highlight";

/**
 * The code itself. Pass `code` (and `language` to highlight it), or put
 * CodeBlockLine children in the default slot for per-line variants.
 */
const props = withDefaults(defineProps<{ code?: string; language?: string; wrap?: boolean; lineNumbers?: boolean; startLine?: number }>(), { startLine: 1 });

const lines = computed(() => (props.code === undefined ? null : highlightLines(props.code, props.language)));
</script>

<template>
	<pre
		data-slot="code-block-content"
		:data-wrap="wrap || undefined"
		:data-numbered="lineNumbers || undefined"
		dir="ltr"
		tabindex="0"
		:style="{ counterReset: `line ${startLine - 1}` }"
		class="scrollbar-thin min-h-0 min-w-0 overflow-auto px-3 py-2.5 text-start font-mono leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-outline-gray-3 group-has-[[data-slot=code-block-header]]/code-block:pt-1.5 group-data-[size=sm]/code-block:px-2.5 group-data-[size=sm]/code-block:py-2 data-[wrap]:whitespace-pre-wrap data-[wrap]:[overflow-wrap:anywhere]"
	><code data-slot="code-block-code" class="grid min-w-max content-start [[data-wrap]>&]:min-w-0"><template v-if="lines"><span
		v-for="(line, index) in lines"
		:key="index"
		data-slot="code-block-line"
		class="block min-h-[1lh]"
		v-html="line || '\n'"
	/></template><slot v-else /></code></pre>
</template>
