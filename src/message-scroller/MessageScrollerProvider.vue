<script setup lang="ts">
import { onBeforeUnmount } from "vue";
import { provideMessageScroller } from "./context";
import { MessageScrollerController } from "./controller";
import type { MessageScrollerDefaultScrollPosition } from "./types";

const props = withDefaults(
	defineProps<{
		autoScroll?: boolean;
		defaultScrollPosition?: MessageScrollerDefaultScrollPosition;
		scrollEdgeThreshold?: number;
		scrollPreviousItemPeek?: number;
		scrollMargin?: number;
	}>(),
	{ autoScroll: false, defaultScrollPosition: "end", scrollEdgeThreshold: 8, scrollPreviousItemPeek: 64, scrollMargin: 0 },
);

const controller = new MessageScrollerController(() => props);
provideMessageScroller(controller);
onBeforeUnmount(() => controller.disconnect());
</script>

<template>
	<slot />
</template>
