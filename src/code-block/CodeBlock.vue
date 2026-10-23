<script setup lang="ts">
/** Code surface. Compose a header, content, actions and footer inside it. */
withDefaults(defineProps<{ variant?: "default" | "destructive"; size?: "default" | "sm" }>(), {
	variant: "default",
	size: "default",
});
</script>

<template>
	<div
		data-slot="code-block"
		:data-variant="variant"
		:data-size="size"
		class="group/code-block relative flex w-full min-w-0 flex-col overflow-hidden rounded-6 border border-outline-gray-1 bg-surface-gray-1 text-sm text-ink-gray-8 data-[size=sm]:rounded-4 data-[variant=destructive]:border-outline-red-2 data-[variant=destructive]:bg-surface-red-1 data-[size=sm]:text-xs data-[variant=destructive]:text-ink-red-7"
	>
		<slot />
	</div>
</template>
