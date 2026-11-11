<script setup lang="ts">
import type { Component } from "vue";
import { Icon } from "frappe-ui";
/** `icon` takes a `lucide-*` class; the default slot overrides it. */
defineProps<{ icon?: string | Component; spin?: boolean }>();
</script>

<template>
	<span data-slot="trace-icon" aria-hidden="true" class="flex size-4 shrink-0 items-center justify-center">
		<slot>
			<Icon v-if="icon" :icon="icon" :class="['size-4', spin && 'animate-spin motion-reduce:animate-none']" />
		</slot>
	</span>
</template>
