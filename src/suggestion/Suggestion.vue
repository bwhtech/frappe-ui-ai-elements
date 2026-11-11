<script setup lang="ts">
import type { Component } from "vue";
import { Button } from "frappe-ui";

/** A one-click prompt. The label is the message, so `select` hands it back as is. */
defineProps<{ suggestion: string; icon?: string | Component }>();
defineEmits<{ select: [suggestion: string] }>();
</script>

<template>
	<Button
		data-slot="suggestion"
		variant="outline"
		size="sm"
		:icon-left="icon"
		class="shrink-0 rounded-full px-2.5 font-normal !text-ink-gray-6 max-sm:h-8 hover:!text-ink-gray-8 relative after:absolute after:inset-0 after:content-[''] [@media(pointer:coarse)]:after:-inset-y-1.5 sm:[@media(pointer:coarse)]:after:-inset-y-2 transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out-strong active:scale-[0.97] motion-reduce:transform-none"
		@click="$emit('select', suggestion)"
	>
		<slot>{{ suggestion }}</slot>
	</Button>
</template>
