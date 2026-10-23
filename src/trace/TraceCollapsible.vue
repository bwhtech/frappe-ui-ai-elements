<script setup lang="ts">
import { computed, useId } from "vue";
import { provideTraceCollapsible } from "./context";

const props = defineProps<{ defaultOpen?: boolean }>();

// Controlled with v-model:open, or local state seeded from defaultOpen.
const open = defineModel<boolean | undefined>("open", { default: undefined });
if (open.value === undefined && props.defaultOpen) open.value = true;

const isOpen = computed(() => open.value ?? false);

provideTraceCollapsible({
	open: isOpen,
	contentId: `trace-${useId()}`,
	toggle: () => (open.value = !isOpen.value),
});
</script>

<template>
	<div data-slot="trace-collapsible" :data-state="isOpen ? 'open' : 'closed'" class="flex w-full min-w-0 flex-col">
		<slot :open="isOpen" />
	</div>
</template>
