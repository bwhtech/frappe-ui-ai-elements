<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import { injectMessageScroller } from "./context";

/**
 * One transcript row. `messageId` makes it addressable for scrollToMessage and
 * visibility tracking. `scrollAnchor` marks a turn boundary, usually the person's message.
 */
const props = defineProps<{ messageId?: string; scrollAnchor?: boolean }>();

const controller = injectMessageScroller(true);
const element = ref<HTMLElement | null>(null);

watch([() => props.messageId, element], ([id, node], [previousId, previousNode]) => {
	if (previousId && previousNode) controller?.visibility.unregister(previousId, previousNode);
	if (id && node) controller?.visibility.register(id, node);
});
onBeforeUnmount(() => {
	if (props.messageId && element.value) controller?.visibility.unregister(props.messageId, element.value);
});
</script>

<template>
	<div
		ref="element"
		data-slot="message-scroller-item"
		:data-message-id="messageId"
		:data-scroll-anchor="scrollAnchor ? 'true' : undefined"
		class="min-w-0 shrink-0"
	>
		<slot />
	</div>
</template>
