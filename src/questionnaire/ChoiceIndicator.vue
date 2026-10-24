<script setup lang="ts">
/** The radio dot or checkbox tick at the end of an answer row. Decorative: the row carries aria-checked. */
defineProps<{ checked: boolean; multiple: boolean }>();
</script>

<template>
	<span
		aria-hidden="true"
		data-slot="questionnaire-choice-indicator"
		:data-state="checked ? 'checked' : 'unchecked'"
		class="mt-0.5 flex size-4 shrink-0 items-center justify-center border border-outline-gray-3 bg-surface-base data-[state=checked]:border-transparent data-[state=checked]:bg-surface-gray-7 data-[state=checked]:text-ink-base"
		:class="multiple ? 'rounded-1' : 'rounded-full'"
	>
		<span v-if="checked && multiple" class="lucide-check size-3" />
		<span v-else-if="checked" class="size-1.5 rounded-full bg-surface-base" />
	</span>
</template>
