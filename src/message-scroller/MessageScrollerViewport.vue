<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watchEffect } from "vue";
import { injectMessageScroller } from "./context";

/**
 * The scrolling element. `preserveScrollOnPrepend` keeps the reader's row in
 * place when older rows load above it; turning it off also turns off the
 * browser's own scroll anchoring, so nothing holds the row. `reach-start` fires when the reader
 * scrolls to the top edge, the moment to load older rows.
 */
const props = withDefaults(defineProps<{ preserveScrollOnPrepend?: boolean }>(), { preserveScrollOnPrepend: true });
const emit = defineEmits<{ "reach-start": [] }>();

const controller = injectMessageScroller();
const viewport = ref<HTMLElement | null>(null);

watchEffect(() => (controller.preserveScrollOnPrepend = props.preserveScrollOnPrepend));
controller.onReachStart = () => emit("reach-start");
onMounted(() => controller.setViewport(viewport.value));
onBeforeUnmount(() => {
	controller.onReachStart = null;
	controller.setViewport(null);
});
</script>

<template>
	<div
		ref="viewport"
		data-slot="message-scroller-viewport"
		:data-pending-scroll="controller.pendingScroll.value || undefined"
		:data-autoscrolling="controller.autoscrolling.value || undefined"
		:style="preserveScrollOnPrepend ? undefined : { overflowAnchor: 'none' }"
		class="scroll-fade-b scrollbar-thin size-full min-h-0 min-w-0 overflow-y-auto overscroll-contain [scrollbar-gutter:stable] data-[pending-scroll]:invisible"
		@scroll.passive="controller.onScroll()"
		@wheel.passive="controller.onWheel($event)"
		@touchmove.passive="controller.onTouchMove()"
		@keydown="controller.onKeydown($event)"
	>
		<slot />
	</div>
</template>
