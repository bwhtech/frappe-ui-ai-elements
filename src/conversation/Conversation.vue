<script setup lang="ts">
import { MessageScroller, MessageScrollerProvider, type MessageScrollerDefaultScrollPosition } from "../message-scroller";

/**
 * The thread container. Follows the reply while the reader is at the live
 * edge, and anchors each new `scrollAnchor` turn near the top.
 */
withDefaults(defineProps<{ autoScroll?: boolean; defaultScrollPosition?: MessageScrollerDefaultScrollPosition }>(), {
	autoScroll: true,
	defaultScrollPosition: "end",
});
</script>

<template>
	<MessageScrollerProvider :auto-scroll="autoScroll" :default-scroll-position="defaultScrollPosition">
		<MessageScroller data-slot="conversation">
			<slot />
		</MessageScroller>
	</MessageScrollerProvider>
</template>
