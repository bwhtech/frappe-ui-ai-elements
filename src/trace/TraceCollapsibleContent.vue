<script setup lang="ts">
import CollapseTransition from "../utils/CollapseTransition.vue";
import { useTraceCollapsible } from "./context";

/** keepMounted keeps closed content in the DOM, so nested state survives. */
defineProps<{ keepMounted?: boolean }>();
// class/attrs go to the inner panel, as in shadcn, so callers can style the content.
defineOptions({ inheritAttrs: false });

const { open, contentId } = useTraceCollapsible("TraceCollapsibleContent");
</script>

<template>
	<CollapseTransition>
		<div v-if="keepMounted || open" v-show="open" :id="contentId" data-slot="trace-collapsible-content" class="min-w-0">
			<div
				data-slot="trace-collapsible-content-inner"
				class="mb-1 ml-[7px] mt-1.5 min-w-0 [@media(pointer:coarse)]:mt-3 break-words border-l border-outline-gray-2 pl-4 pr-1 text-p-sm text-ink-gray-6"
				v-bind="$attrs"
			>
				<slot />
			</div>
		</div>
	</CollapseTransition>
</template>
