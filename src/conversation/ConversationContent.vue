<script setup lang="ts">
import { MessageScrollerContent, MessageScrollerViewport } from "../message-scroller";

// class/attrs go to the content column, so callers set its width and padding.
defineOptions({ inheritAttrs: false });
</script>

<template>
	<MessageScrollerViewport>
		<MessageScrollerContent v-bind="$attrs">
			<slot />
		</MessageScrollerContent>
	</MessageScrollerViewport>
</template>
