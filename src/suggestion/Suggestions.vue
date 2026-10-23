<script setup lang="ts">
/** A row of suggestions. It scrolls sideways when they do not fit; `wrap` stacks them instead. */
defineProps<{ wrap?: boolean }>();
</script>

<template>
	<div
		data-slot="suggestions"
		:data-wrap="wrap || undefined"
		class="scroll-fade-x scrollbar-none flex w-full min-w-0 gap-2 overflow-x-auto overscroll-x-contain data-[wrap]:flex-wrap data-[wrap]:overflow-visible data-[wrap]:[mask-image:none]"
	>
		<slot />
	</div>
</template>
