<script setup lang="ts">
import { Button } from "frappe-ui";

/** `variant="solid"` for the approving action, `subtle` (default) for the other. */
withDefaults(defineProps<{ label?: string; variant?: "solid" | "subtle" | "outline" | "ghost"; theme?: "gray" | "red" }>(), {
	variant: "subtle",
	theme: "gray",
});
defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
	<Button size="sm" :variant="variant" :theme="theme" @click="$emit('click', $event)"><slot>{{ label }}</slot></Button>
</template>
