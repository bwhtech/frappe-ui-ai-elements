<script setup lang="ts">
import { useTraceCollapsible } from "./context";

const { open, toggle, contentId } = useTraceCollapsible("TraceCollapsibleTrigger");
</script>

<template>
	<button
		type="button"
		data-slot="trace-collapsible-trigger"
		data-trace-trigger
		:aria-expanded="open"
		:aria-controls="contentId"
		class="touch-target group/trace-trigger flex w-fit min-w-0 max-w-full cursor-pointer items-center gap-1 rounded-4 text-left text-ink-gray-6 transition-colors hover:text-ink-gray-8 [&>[data-slot=trace-line]]:text-inherit"
		@click="toggle"
	>
		<slot />
		<span
			aria-hidden="true"
			class="lucide-chevron-right size-3.5 shrink-0 opacity-70 transition-transform duration-200 ease-out-strong motion-reduce:transition-none group-aria-expanded/trace-trigger:rotate-90"
		/>
	</button>
</template>
