<script setup lang="ts">
export type BubbleVariant = "default" | "secondary" | "muted" | "tinted" | "outline" | "ghost" | "destructive";

withDefaults(defineProps<{ variant?: BubbleVariant; align?: "start" | "end" }>(), {
	variant: "default",
	align: "start",
});
</script>

<template>
	<div
		data-slot="bubble"
		:data-variant="variant"
		:data-align="align"
		class="group/bubble relative flex w-fit min-w-0 max-w-[85%] flex-col gap-1 data-[align=end]:self-end data-[variant=ghost]:max-w-full"
	>
		<slot />
	</div>
</template>
