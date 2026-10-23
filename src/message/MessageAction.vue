<script setup lang="ts">
import type { Component } from "vue";
import { Button, Tooltip } from "frappe-ui";

/** A ghost icon button with a tooltip. `label` is also the accessible name. */
defineProps<{ label: string; icon?: string | Component; pressed?: boolean; disabled?: boolean }>();
defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
	<Tooltip :text="label">
		<Button
			variant="ghost"
			size="sm"
			:icon="icon"
			:aria-label="label"
			:aria-pressed="pressed"
			:disabled="disabled"
			class="text-ink-gray-5 hover:text-ink-gray-8"
			@click="$emit('click', $event)"
		>
			<slot />
		</Button>
	</Tooltip>
</template>
