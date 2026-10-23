<script setup lang="ts">
import type { Component } from "vue";
import { Icon } from "frappe-ui";
defineProps<{ icon?: string | Component }>();
</script>

<template>
	<div
		data-slot="code-block-title"
		class="flex min-w-0 items-center gap-1.5 truncate font-sans text-sm-medium text-ink-gray-7 group-data-[size=sm]/code-block:text-xs-medium"
	>
		<Icon v-if="icon" :icon="icon" class="size-3.5 shrink-0" />
		<span class="truncate"><slot /></span>
	</div>
</template>
