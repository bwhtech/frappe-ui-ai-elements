<script setup lang="ts">
/** One transcript row. `scrollAnchor` marks a turn boundary, usually the person's message. */
defineProps<{ messageId?: string; scrollAnchor?: boolean }>();
</script>

<template>
	<div
		data-slot="message-scroller-item"
		:data-message-id="messageId"
		:data-scroll-anchor="scrollAnchor ? 'true' : undefined"
		class="min-w-0 shrink-0"
	>
		<slot />
	</div>
</template>
