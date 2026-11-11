<script setup lang="ts">
import type { Component } from "vue";
import { Icon } from "frappe-ui";
withDefaults(defineProps<{ title?: string; description?: string; icon?: string | Component }>(), {
	title: "No messages yet",
	description: "Start a conversation to see messages here.",
	icon: "lucide-message-circle",
});
</script>

<template>
	<div data-slot="conversation-empty-state" class="flex size-full flex-col items-center justify-center gap-3 p-8 text-center">
		<slot>
			<div class="rounded-full bg-surface-gray-2 p-3 text-ink-gray-5">
				<Icon :icon="icon" class="block size-6" />
			</div>
			<div class="space-y-1.5">
				<p class="text-lg-semibold text-ink-gray-8">{{ title }}</p>
				<p class="text-p-base text-ink-gray-6">{{ description }}</p>
			</div>
			<slot name="actions" />
		</slot>
	</div>
</template>
