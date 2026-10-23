<script setup lang="ts">
defineProps<{ title?: string; description?: string }>();
</script>

<template>
	<div data-slot="confirmation-title" class="min-w-0 flex-1 basis-48 [overflow-wrap:anywhere]">
		<p class="text-p-base-medium text-ink-gray-8"><slot>{{ title }}</slot></p>
		<p v-if="description || $slots.description" class="mt-1 text-p-sm text-ink-gray-5">
			<slot name="description">{{ description }}</slot>
		</p>
	</div>
</template>
