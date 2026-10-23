<script setup lang="ts">
/** A one-line note in the transcript: a status, a separator, or a checkpoint. */
withDefaults(defineProps<{ variant?: "default" | "separator" | "border"; as?: string }>(), {
	variant: "default",
	as: "div",
});
</script>

<template>
	<component
		:is="as"
		data-slot="marker"
		:data-variant="variant"
		class="group/marker relative flex min-h-4 w-full items-center gap-2 text-left text-p-sm text-ink-gray-5 data-[variant=border]:border-b data-[variant=border]:border-outline-gray-1 data-[variant=border]:pb-2 data-[variant=separator]:before:mr-1 data-[variant=separator]:before:h-px data-[variant=separator]:before:min-w-0 data-[variant=separator]:before:flex-1 data-[variant=separator]:before:bg-surface-gray-3 data-[variant=separator]:before:content-[''] data-[variant=separator]:after:ml-1 data-[variant=separator]:after:h-px data-[variant=separator]:after:min-w-0 data-[variant=separator]:after:flex-1 data-[variant=separator]:after:bg-surface-gray-3 data-[variant=separator]:after:content-['']"
	>
		<slot />
	</component>
</template>
