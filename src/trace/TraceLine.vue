<script setup lang="ts">
import type { TraceStatus } from "./context";

defineProps<{ status?: TraceStatus }>();
</script>

<template>
	<span
		data-slot="trace-line"
		:data-status="status"
		class="flex w-fit min-w-0 max-w-full items-center gap-2 text-p-sm text-ink-gray-6 transition-colors data-[status=pending]:opacity-60 [&[data-status=running]>[data-slot=trace-title]]:shimmer"
	>
		<slot />
	</span>
</template>
