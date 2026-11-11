<script setup lang="ts">
import { ref } from "vue";
import {
	Bubble,
	BubbleContent,
	Message,
	MessageAction,
	MessageActions,
	MessageAvatar,
	MessageContent,
	MessageCopyAction,
	MessageHeader,
	Response,
} from "frappe-ui-ai-elements";
import DemoBlock from "../DemoBlock.vue";
import { replyMarkdown, richReplyCitations, richReplyMarkdown } from "../fixtures";

const liked = ref<boolean | null>(null);
const longWord = "Pneumonoultramicroscopicsilicovolcanoconiosis-and-a-very-long-unbroken-url-https://example.org/a/b/c/d/e/f/g/h";
</script>

<template>
	<DemoBlock id="message" title="Message & Response" part="text" description="The person's turn is a muted bubble at the end. The agent's turn is markdown with actions under it: tables, code, LaTeX maths, Mermaid diagrams and citation chips.">
		<div class="flex flex-col gap-8">
			<Message from="user">
				<MessageContent>We need to track volunteers: name, phone, area and which days they are free.</MessageContent>
			</Message>
			<Message from="assistant">
				<MessageContent>
					<Response :content="replyMarkdown" />
					<MessageActions>
						<MessageCopyAction :value="replyMarkdown" />
						<MessageAction label="Good response" icon="lucide-thumbs-up" :pressed="liked === true" @click="liked = true" />
						<MessageAction label="Bad response" icon="lucide-thumbs-down" :pressed="liked === false" @click="liked = false" />
						<MessageAction label="Retry" icon="lucide-refresh-cw" />
					</MessageActions>
				</MessageContent>
			</Message>
			<Message from="assistant">
				<MessageContent>
					<Response :content="richReplyMarkdown" :citations="richReplyCitations" />
				</MessageContent>
			</Message>
			<Message from="user">
				<MessageAvatar name="Asha Rao" />
				<MessageContent bare>
					<MessageHeader>Asha · 5:42 PM</MessageHeader>
					<Bubble align="end" variant="muted"><BubbleContent>Unbroken text: {{ longWord }}</BubbleContent></Bubble>
				</MessageContent>
			</Message>
			<div class="flex flex-wrap gap-2">
				<Bubble v-for="v in ['default', 'secondary', 'muted', 'tinted', 'outline', 'destructive'] as const" :key="v" :variant="v">
					<BubbleContent>{{ v }} bubble</BubbleContent>
				</Bubble>
			</div>
		</div>
	</DemoBlock>
</template>
