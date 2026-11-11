<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { injectMessageScroller } from "./context";

const controller = injectMessageScroller();
const content = ref<HTMLElement | null>(null);
const spacer = ref<HTMLElement | null>(null);

onMounted(() => {
	controller.setSpacer(spacer.value);
	controller.setContent(content.value);
});
onBeforeUnmount(() => controller.setContent(null));
</script>

<template>
	<div ref="content" data-slot="message-scroller-content" role="log" aria-relevant="additions" class="flex h-max min-h-full flex-col gap-8">
		<slot />
		<!-- Tail spacer: lets a short new turn scroll up to the top. -->
		<div ref="spacer" aria-hidden="true" class="pointer-events-none hidden shrink-0" />
	</div>
</template>
