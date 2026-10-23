<script setup lang="ts">
defineProps<{ id: string; title: string; description?: string; part?: string }>();
</script>

<template>
	<section :id="id" class="scroll-mt-16 space-y-3">
		<div class="space-y-1">
			<div class="flex flex-wrap items-center gap-2">
				<h2 class="text-lg-semibold text-ink-gray-9">{{ title }}</h2>
				<code v-if="part" class="rounded-2 bg-surface-gray-2 px-1.5 py-0.5 font-mono text-xs text-ink-gray-6">{{ part }}</code>
			</div>
			<p v-if="description" class="text-p-sm text-ink-gray-5">{{ description }}</p>
		</div>
		<div class="rounded-6 border border-outline-gray-1 bg-surface-base p-4 sm:p-5">
			<slot />
		</div>
	</section>
</template>
