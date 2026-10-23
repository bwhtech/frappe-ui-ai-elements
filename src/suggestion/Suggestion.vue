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
		size="md"
		:icon-left="icon"
		class="shrink-0 rounded-full"
		@click="$emit('select', suggestion)"
	>
		<slot>{{ suggestion }}</slot>
	</Button>
</template>
