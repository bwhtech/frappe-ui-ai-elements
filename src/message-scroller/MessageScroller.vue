<script setup lang="ts">
import { computed } from "vue";
import { injectMessageScroller } from "./context";

const controller = injectMessageScroller();
const scrollable = computed(() =>
	[controller.scrollable.start && "start", controller.scrollable.end && "end"].filter(Boolean).join(" ") || undefined,
);
</script>

<template>
	<div
		data-slot="message-scroller"
		:data-scrollable="scrollable"
		:data-autoscrolling="controller.autoscrolling.value || undefined"
		class="group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden"
	>
		<slot />
	</div>
</template>
