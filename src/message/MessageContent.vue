<script setup lang="ts">
import Bubble from "../bubble/Bubble.vue";
import BubbleContent from "../bubble/BubbleContent.vue";
import { useMessageRole } from "./context";

/** The body of a turn. The person's text sits in a muted bubble; set `bare` to skip it. */
defineProps<{ bare?: boolean }>();
const role = useMessageRole();
</script>

<template>
	<div
		data-slot="message-content"
		class="flex w-full min-w-0 flex-col gap-2.5 break-words group-data-[align=end]/message:items-end"
	>
		<Bubble v-if="role === 'user' && !bare" align="end" variant="muted">
			<BubbleContent class="whitespace-pre-wrap"><slot /></BubbleContent>
		</Bubble>
		<slot v-else />
	</div>
</template>
