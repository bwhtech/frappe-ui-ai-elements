<script setup lang="ts">
import type { Component } from "vue";
import { Icon } from "frappe-ui";
defineProps<{ icon?: string | Component }>();
</script>

<template>
	<span data-slot="marker-icon" aria-hidden="true" class="flex size-4 shrink-0 items-center justify-center">
		<slot><Icon v-if="icon" :icon="icon" class="size-4" /></slot>
	</span>
</template>
