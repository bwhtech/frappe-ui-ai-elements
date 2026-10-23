<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { injectMessageScroller } from "./context";

const controller = injectMessageScroller();
const viewport = ref<HTMLElement | null>(null);

onMounted(() => controller.setViewport(viewport.value));
onBeforeUnmount(() => controller.setViewport(null));
</script>

<template>
	<div
		ref="viewport"
		data-slot="message-scroller-viewport"
		:data-pending-scroll="controller.pendingScroll.value || undefined"
		:data-autoscrolling="controller.autoscrolling.value || undefined"
		class="scroll-fade-b scrollbar-thin size-full min-h-0 min-w-0 overflow-y-auto overscroll-contain [scrollbar-gutter:stable] data-[pending-scroll]:invisible"
		@scroll.passive="controller.onScroll()"
		@wheel.passive="controller.onWheel($event)"
		@touchmove.passive="controller.onTouchMove()"
		@keydown="controller.onKeydown($event)"
	>
		<slot />
	</div>
</template>
