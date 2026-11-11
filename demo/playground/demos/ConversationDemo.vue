<script setup lang="ts">
import { computed } from "vue";
import { Conversation, ConversationContent, ConversationEmptyState, ConversationItem, ConversationScrollButton, Message, MessageContent, Response } from "frappe-ui-ai-elements";
import type { Values } from "../types";
import { worst as w } from "../worst";

const props = defineProps<{ v: Values; worst: boolean }>();
const turns = computed(() =>
	Array.from({ length: Number(props.v.count) }, (_, i) => ({
		id: `t${i}`,
		role: i % 2 ? ("assistant" as const) : ("user" as const),
		text: props.worst ? (i % 2 ? `${w.marathi}\n\n\`${w.unbroken}\`` : w.hindi) : i % 2 ? `Reply ${i}: done. I updated the **Volunteer** list.` : `Question ${i}: can you add a field for T-shirt size?`,
	})),
);
</script>

<template>
	<div class="h-[460px] overflow-hidden rounded-6 border border-outline-gray-1">
		<ConversationEmptyState v-if="v.empty || !turns.length" :title="String(v.emptyTitle)" description="Describe what your team needs to track." icon="lucide-sprout" />
		<Conversation v-else :key="`${v.position}-${v.autoScroll}`" :auto-scroll="Boolean(v.autoScroll)" :default-scroll-position="(v.position as 'start' | 'end' | 'last-anchor')">
			<ConversationContent class="px-4 py-5">
				<ConversationItem v-for="turn in turns" :key="turn.id" :message-id="turn.id" :scroll-anchor="turn.role === 'user'">
					<Message :from="turn.role">
						<MessageContent>
							<template v-if="turn.role === 'user'">{{ turn.text }}</template>
							<Response v-else :content="turn.text" />
						</MessageContent>
					</Message>
				</ConversationItem>
			</ConversationContent>
			<ConversationScrollButton />
		</Conversation>
	</div>
</template>
