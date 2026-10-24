<script setup lang="ts">
/** The key that picks an answer row. Decorative: the row says it in aria-keyshortcuts. */
defineProps<{ label?: string; checked?: boolean }>();
</script>

<template>
	<kbd
		v-if="label"
		aria-hidden="true"
		data-slot="questionnaire-choice-shortcut"
		:data-state="checked ? 'checked' : 'unchecked'"
		class="flex size-5 shrink-0 items-center justify-center rounded-3 bg-surface-gray-2 font-sans text-xs-medium tabular-nums text-ink-gray-6 data-[state=checked]:bg-surface-gray-7 data-[state=checked]:text-ink-base"
		>{{ label }}</kbd
	>
	<span v-else aria-hidden="true" class="size-5 shrink-0" />
</template>
