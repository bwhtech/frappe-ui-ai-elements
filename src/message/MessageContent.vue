<script setup lang="ts">
import Bubble from "../bubble/Bubble.vue";
import BubbleContent from "../bubble/BubbleContent.vue";
import { provideInBubble, useMessageRole } from "./context";

/**
 * The body of a turn. The person's text sits in a muted bubble; set `bare` to skip it.
 * Around MessageParts, set `bare` for the person's turns: MessageParts draws the bubble
 * around their text itself, and keeps attached files outside it.
 */
const props = defineProps<{ bare?: boolean }>();
const role = useMessageRole();
provideInBubble(() => role.value === "user" && !props.bare);
</script>

<template>
	<div data-slot="message-content" class="flex w-full min-w-0 flex-col gap-2.5 break-words group-data-[align=end]/message:items-end">
		<Bubble v-if="role === 'user' && !bare" align="end" variant="muted">
			<BubbleContent class="whitespace-pre-wrap"><slot /></BubbleContent>
		</Bubble>
		<slot v-else />
	</div>
</template>
