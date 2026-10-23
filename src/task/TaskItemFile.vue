<script setup lang="ts">
import type { Component } from "vue";
import { Icon } from "frappe-ui";
withDefaults(defineProps<{ icon?: string | Component }>(), { icon: "lucide-file" });
</script>

<template>
	<span
		data-slot="task-item-file"
		class="mx-0.5 inline-flex items-center gap-1 rounded-3 border border-outline-gray-1 bg-surface-gray-1 px-1.5 py-px align-middle font-mono text-xs text-ink-gray-7"
	>
		<Icon :icon="icon" class="size-3" />
		<slot />
	</span>
</template>
