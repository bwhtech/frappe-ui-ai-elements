<script setup lang="ts">
import { computed, ref, toRef, watch } from "vue";
import { Trace, TraceCollapsible } from "../trace";
import { provideReasoning } from "./context";

/**
 * The model's thinking. Opens while it streams and closes when it finishes,
 * unless the person opened or closed it — then their choice wins.
 * `duration` (seconds) can come from the server; otherwise it is timed here.
 */
const props = defineProps<{ isStreaming?: boolean; defaultOpen?: boolean; duration?: number }>();
const open = defineModel<boolean | undefined>("open", { default: undefined });
if (open.value === undefined && props.defaultOpen) open.value = true;

const startedAt = ref<number | null>(props.isStreaming ? Date.now() : null);
const measured = ref<number>();

watch(
	() => props.isStreaming,
	(streaming) => {
		if (streaming) startedAt.value = Date.now();
		else if (startedAt.value !== null) measured.value = Math.max(1, Math.round((Date.now() - startedAt.value) / 1000));
	},
);

const effectiveOpen = computed(() => open.value ?? !!props.isStreaming);
provideReasoning({
	isStreaming: toRef(() => !!props.isStreaming),
	duration: toRef(() => props.duration ?? measured.value),
});
</script>

<template>
	<Trace data-slot="reasoning">
		<TraceCollapsible :open="effectiveOpen" @update:open="open = $event">
			<slot />
		</TraceCollapsible>
	</Trace>
</template>
