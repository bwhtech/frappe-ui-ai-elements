<script setup lang="ts">
/** The bubble surface. Its colours come from the parent Bubble's variant. */
withDefaults(defineProps<{ as?: string }>(), { as: "div" });
</script>

<template>
	<component
		:is="as"
		data-slot="bubble-content"
		class="w-fit min-w-0 max-w-full overflow-hidden break-words rounded-7 border border-transparent px-3.5 py-2 text-p-base text-ink-gray-8 group-data-[align=end]/bubble:self-end group-data-[variant=default]/bubble:bg-surface-gray-7 group-data-[variant=default]/bubble:text-ink-base group-data-[variant=secondary]/bubble:bg-surface-gray-3 group-data-[variant=muted]/bubble:bg-surface-gray-2 group-data-[variant=tinted]/bubble:bg-surface-blue-1 group-data-[variant=outline]/bubble:border-outline-gray-2 group-data-[variant=outline]/bubble:bg-surface-base group-data-[variant=ghost]/bubble:rounded-none group-data-[variant=ghost]/bubble:p-0 group-data-[variant=destructive]/bubble:bg-surface-red-2 group-data-[variant=destructive]/bubble:text-ink-red-7 [&:is(button,a)]:text-left [&:is(button,a)]:transition-colors"
	>
		<slot />
	</component>
</template>
