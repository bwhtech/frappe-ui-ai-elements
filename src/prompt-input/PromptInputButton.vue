<script setup lang="ts">
import type { Component } from "vue";
import { Button, Tooltip } from "frappe-ui";

/** A ghost toolbar button. Give icon-only buttons a `label` for the tooltip and screen readers. */
defineProps<{ label?: string; icon?: string | Component; iconLeft?: string | Component; disabled?: boolean }>();
defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
	<Tooltip :text="label" :disabled="!label || !!$slots.default">
		<Button
			variant="ghost"
			size="sm"
			:icon="$slots.default ? undefined : icon"
			:icon-left="iconLeft"
			:aria-label="label"
			:disabled="disabled"
			class="text-ink-gray-6"
			@click="$emit('click', $event)"
		>
			<slot />
		</Button>
	</Tooltip>
</template>
