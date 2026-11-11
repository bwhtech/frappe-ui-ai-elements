<script setup lang="ts">
import { Button } from "frappe-ui";

/** A bar over several pending approvals in one message, to answer them all at once. */
defineProps<{ count: number; disabled?: boolean }>();
defineEmits<{ approve: []; deny: [] }>();
</script>

<template>
	<div
		data-slot="confirmation-batch"
		role="group"
		:aria-label="`${count} changes waiting for approval`"
		class="flex flex-wrap items-center gap-2 rounded-6 border border-outline-amber-3 bg-surface-amber-2 px-3 py-2"
	>
		<span class="lucide-shield-check size-4 shrink-0 text-ink-amber-7" aria-hidden="true" />
		<span class="min-w-0 flex-1 text-p-sm text-ink-gray-8"> {{ count }} changes are waiting for you. Check them below, or answer them all at once. </span>
		<div class="flex shrink-0 gap-2">
			<Button size="sm" label="Deny all" :disabled="disabled" @click="$emit('deny')" />
			<Button size="sm" variant="solid" :label="`Approve all ${count}`" :disabled="disabled" @click="$emit('approve')" />
		</div>
	</div>
</template>
