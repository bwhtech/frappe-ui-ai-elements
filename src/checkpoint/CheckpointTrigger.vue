<script setup lang="ts">
import { Button, Tooltip } from "frappe-ui";

withDefaults(defineProps<{ label?: string; tooltip?: string }>(), { label: "Restore" });
defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
	<Tooltip :text="tooltip" :disabled="!tooltip">
		<Button size="xs" variant="outline" :label="label" @click="$emit('click', $event)" />
	</Tooltip>
</template>
