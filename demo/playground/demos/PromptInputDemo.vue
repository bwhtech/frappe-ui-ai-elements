<script setup lang="ts">
import type { ChatStatus } from "ai";
import { computed, ref } from "vue";
import {
	Attachment,
	Context,
	ModelSelector,
	PromptInput,
	PromptInputAttachButton,
	PromptInputFooter,
	PromptInputHeader,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputTools,
} from "@bwhtech/frappe-ui-ai-elements";
import { useLog } from "../log";
import type { Values } from "../types";
import { worst as w } from "../worst";

const props = defineProps<{ v: Values; worst: boolean }>();
const log = useLog();
const text = ref("");
const model = ref("sonnet");
const status = computed(() => props.v.status as ChatStatus);
const files = computed(() =>
	props.worst
		? [{ name: `${w.name}.xlsx`, size: 9_812_331 }, { name: `${w.unbroken}.pdf`, mediaType: "application/pdf", state: "error" as const }]
		: [{ name: "volunteers.xlsx", size: 48_213 }, { name: "poster.png", mediaType: "image/png", state: "uploading" as const }],
);
</script>

<template>
	<PromptInput v-model="text" :status="status" :disabled="Boolean(v.disabled)" @submit="log('submit', { text: $event.text, files: $event.files.length })" @stop="log('stop')">
		<PromptInputHeader v-if="v.attachments">
			<Attachment v-for="file in files" :key="file.name" v-bind="file" removable @remove="log('remove-attachment', file.name)" />
		</PromptInputHeader>
		<PromptInputTextarea :placeholder="worst ? w.hindi : String(v.placeholder)" />
		<PromptInputFooter>
			<PromptInputTools>
				<PromptInputAttachButton />
				<ModelSelector
					v-if="v.model"
					v-model="model"
					:models="[
						{ id: 'sonnet', name: worst ? w.name : 'Claude Sonnet', provider: 'Anthropic' },
						{ id: 'gpt', name: 'GPT-5', provider: 'OpenAI' },
					]"
					@update:model-value="log('model', $event)"
				/>
			</PromptInputTools>
			<div class="flex items-center gap-1">
				<Context v-if="v.context" :used-tokens="48200" :max-tokens="200000" />
				<PromptInputSubmit />
			</div>
		</PromptInputFooter>
	</PromptInput>
</template>
