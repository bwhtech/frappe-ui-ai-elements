<script setup lang="ts">
import { Button } from "frappe-ui";
import { ref } from "vue";
import {
	Conversation,
	ConversationContent,
	ConversationEmptyState,
	ConversationItem,
	ConversationScrollButton,
	Message,
	MessageContent,
	MessageParts,
	PromptInput,
	PromptInputFooter,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputTools,
	PromptInputAttachButton,
	Suggestion,
	Suggestions,
} from "@bwhtech/frappe-ui-ai-elements";
import DemoBlock from "../DemoBlock.vue";
import { suggestions, transcript } from "../fixtures";
import { useScriptedChat } from "../scripted-chat";

const withHistory = ref(true);
const chat = useScriptedChat(transcript);
const draft = ref("");

function toggleHistory() {
	withHistory.value = !withHistory.value;
	chat.messages.value = withHistory.value ? [...transcript] : [];
}
</script>

<template>
	<DemoBlock
		id="chat"
		title="Chat"
		part="Conversation + Message + PromptInput"
		description="Send anything: a scripted turn streams reasoning, a tool call and a markdown reply. The person's message anchors near the top; the reply follows while you stay at the end. Scroll up mid-stream to see it let go."
	>
		<div class="mb-3 flex flex-wrap gap-2">
			<Button size="sm" :label="withHistory ? 'Empty thread' : 'Load saved thread'" @click="toggleHistory" />
		</div>
		<div class="flex h-[560px] flex-col overflow-hidden rounded-6 border border-outline-gray-1 bg-surface-base">
			<div class="relative min-h-0 flex-1">
				<ConversationEmptyState
					v-if="chat.messages.value.length === 0"
					icon="lucide-sparkles"
					title="What should we build?"
					description="Describe what your team needs to track. The agent builds it on your site."
				/>
				<Conversation v-else>
					<ConversationContent class="mx-auto w-full max-w-[720px] px-4 py-5">
						<ConversationItem
							v-for="message in chat.messages.value"
							:key="message.id"
							:message-id="message.id"
							:scroll-anchor="message.role === 'user'"
						>
							<Message :from="message.role">
								<MessageContent>
									<MessageParts
										:message="message"
										:streaming="chat.status.value === 'streaming' && message === chat.messages.value.at(-1)"
									/>
								</MessageContent>
							</Message>
						</ConversationItem>
					</ConversationContent>
					<ConversationScrollButton />
				</Conversation>
			</div>
			<div class="mx-auto w-full max-w-[720px] space-y-2 px-4 pb-4">
				<Suggestions v-if="chat.messages.value.length === 0">
					<Suggestion v-for="s in suggestions" :key="s" :suggestion="s" @select="chat.send" />
				</Suggestions>
				<PromptInput v-model="draft" :status="chat.status.value" @submit="chat.send($event.text)" @stop="chat.stop">
					<PromptInputTextarea placeholder="Describe what you need…" />
					<PromptInputFooter>
						<PromptInputTools><PromptInputAttachButton /></PromptInputTools>
						<PromptInputSubmit />
					</PromptInputFooter>
				</PromptInput>
			</div>
		</div>
	</DemoBlock>
</template>
