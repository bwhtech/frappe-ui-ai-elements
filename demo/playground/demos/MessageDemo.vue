<script setup lang="ts">
import { computed, ref } from "vue";
import { Bubble, BubbleContent, Message, MessageAction, MessageActions, MessageAvatar, MessageContent, MessageCopyAction, MessageHeader, Response } from "frappe-ui-ai-elements";
import { useLog } from "../log";
import type { Values } from "../types";
import { worst as w } from "../worst";

const props = defineProps<{ v: Values; worst: boolean }>();
const log = useLog();
const liked = ref<boolean | null>(null);
const text = computed(() => (props.worst ? `${w.hindi}\n\n${w.unbroken} ${w.emoji}\n\n**${w.name}**` : String(props.v.text)));
const from = computed(() => props.v.from as "user" | "assistant");
// With a header or actions, the person's text gets its own bubble so they sit outside it.
const ownBubble = computed(() => from.value === "user" && Boolean(props.v.header || props.v.actions));

function rate(value: boolean) {
	liked.value = liked.value === value ? null : value;
	log(value ? "good-response" : "bad-response", liked.value);
}
</script>

<template>
	<Message :from="from">
		<MessageAvatar v-if="v.avatar" :name="worst ? w.name : from === 'user' ? 'Asha Rao' : 'Seva'" />
		<MessageContent :bare="ownBubble">
			<MessageHeader v-if="v.header">{{ worst ? w.name : String(v.header) }}</MessageHeader>
			<Bubble v-if="ownBubble" align="end" variant="muted"><BubbleContent class="whitespace-pre-wrap">{{ text }}</BubbleContent></Bubble>
			<template v-else-if="from === 'user'">{{ text }}</template>
			<Response v-else :content="text" />
			<MessageActions v-if="v.actions">
				<MessageCopyAction :value="text" />
				<template v-if="from === 'assistant'">
					<MessageAction label="Good response" icon="lucide-thumbs-up" :pressed="liked === true" @click="rate(true)" />
					<MessageAction label="Bad response" icon="lucide-thumbs-down" :pressed="liked === false" @click="rate(false)" />
					<MessageAction label="Retry" icon="lucide-refresh-cw" @click="log('retry')" />
				</template>
				<MessageAction v-else label="Edit" icon="lucide-pencil" @click="log('edit', text)" />
			</MessageActions>
		</MessageContent>
	</Message>
</template>
