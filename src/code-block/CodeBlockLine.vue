<script setup lang="ts">
/** One line, for hand-built content: diffs and highlighted lines. */
withDefaults(defineProps<{ variant?: "default" | "added" | "removed" | "highlighted" }>(), { variant: "default" });
</script>

<template>
	<span
		data-slot="code-block-line"
		:data-variant="variant"
		class="relative -mx-3 block min-h-[1lh] px-3 data-[variant=added]:bg-surface-green-2 data-[variant=highlighted]:bg-surface-gray-3 data-[variant=removed]:bg-surface-red-2 data-[variant=added]:after:absolute data-[variant=added]:after:left-1 data-[variant=added]:after:content-['+'] data-[variant=removed]:after:absolute data-[variant=removed]:after:left-1 data-[variant=removed]:after:text-ink-red-6 data-[variant=removed]:after:content-['−']"
		><slot>{{ "\n" }}</slot></span
	>
</template>
