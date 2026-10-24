<script setup lang="ts">
import type { ChatStatus } from "ai";
import { ref } from "vue";
import {
	ModelSelector,
	PromptInput,
	PromptInputAttachButton,
	PromptInputButton,
	PromptInputFooter,
	PromptInputHeader,
	PromptInputQueue,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputTools,
	Context,
	Attachment,
} from "@bwhtech/frappe-ui-ai-elements";
import DemoBlock from "../DemoBlock.vue";

const queued = ref([
	{ id: "q1", text: "Also add a phone number field", files: 0 },
	{ id: "q2", text: "Here is last month's attendance sheet", files: 1 },
]);
const queueText = ref("");
const steered = ref("");

function queueMessage(text: string) {
	queued.value.push({ id: crypto.randomUUID(), text, files: 0 });
}

function reorder(ids: string[]) {
	queued.value = ids.map((id) => queued.value.find((item) => item.id === id)!);
}

const statuses: ChatStatus[] = ["ready", "submitted", "streaming", "error"];
const texts = ref<Record<string, string>>({ ready: "A sign-up form for our weekend food drive", submitted: "", streaming: "", error: "" });
const sent = ref("");
const model = ref("sonnet");
const effort = ref("medium");
const models = [
	{ id: "sonnet", name: "Claude Sonnet", provider: "Anthropic" },
	{ id: "haiku", name: "Claude Haiku", provider: "Anthropic" },
	{ id: "gpt", name: "GPT-5", provider: "OpenAI" },
];
const efforts = [
	{ id: "low", name: "Low" },
	{ id: "medium", name: "Medium" },
	{ id: "high", name: "High" },
];
</script>

<template>
	<DemoBlock
		id="prompt-input"
		title="Prompt Input"
		part="PromptInput"
		description="Enter sends, Shift+Enter adds a line. The submit button follows the chat status: Send, a spinner while submitted, Stop while streaming."
	>
		<div class="flex flex-col gap-5">
			<div v-for="status in statuses" :key="status" class="space-y-1.5">
				<p class="text-xs-medium text-ink-gray-5">status = {{ status }}</p>
				<PromptInput v-model="texts[status]" :status="status" @submit="sent = $event.text" @stop="sent = '(stop)'">
					<PromptInputTextarea placeholder="Describe what you need…" />
					<PromptInputFooter>
						<PromptInputTools>
							<PromptInputAttachButton />
							<template v-if="status === 'ready'">
								<ModelSelector v-model="model" :models="models" />
								<ModelSelector v-model="effort" :models="efforts" label="Effort" />
							</template>
						</PromptInputTools>
						<div class="flex items-center gap-1">
							<Context v-if="status === 'ready'" :used-tokens="48200" :max-tokens="200000" :usage="{ inputTokens: 41000, outputTokens: 7200 }" model-id="anthropic/claude-sonnet-5.5" />
							<PromptInputSubmit />
						</div>
					</PromptInputFooter>
				</PromptInput>
			</div>
			<div class="space-y-1.5">
				<p class="text-xs-medium text-ink-gray-5">with attachments in the header</p>
				<PromptInput>
					<PromptInputHeader>
						<Attachment name="volunteers-2026.xlsx" :size="48213" removable />
						<Attachment name="poster.png" media-type="image/png" state="uploading" removable />
						<Attachment name="broken.pdf" media-type="application/pdf" state="error" removable />
					</PromptInputHeader>
					<PromptInputTextarea placeholder="Import these volunteers" />
					<PromptInputFooter>
						<PromptInputTools><PromptInputAttachButton /><PromptInputButton icon-left="lucide-globe">Search</PromptInputButton></PromptInputTools>
						<PromptInputSubmit />
					</PromptInputFooter>
				</PromptInput>
			</div>
			<div class="space-y-1.5">
				<p class="text-xs-medium text-ink-gray-5">queue while streaming: Enter queues, Steer sends now</p>
				<div>
					<PromptInputQueue
						:items="queued"
						@steer="(id) => { steered = queued.find((item) => item.id === id)?.text ?? ''; queued = queued.filter((item) => item.id !== id) }"
						@remove="(id) => (queued = queued.filter((item) => item.id !== id))"
						@update="(id, text) => (queued.find((item) => item.id === id)!.text = text)"
						@reorder="reorder"
					/>
					<PromptInput v-model="queueText" status="streaming" queue @submit="queueMessage($event.text)">
						<PromptInputTextarea placeholder="Write while the agent works…" />
						<PromptInputFooter>
							<PromptInputTools><PromptInputAttachButton /></PromptInputTools>
							<PromptInputSubmit />
						</PromptInputFooter>
					</PromptInput>
				</div>
				<p class="text-sm text-ink-gray-5">Steered: <span class="text-ink-gray-8">{{ steered || "—" }}</span></p>
			</div>
			<p class="text-sm text-ink-gray-5">Last submit: <span class="text-ink-gray-8">{{ sent || "—" }}</span></p>
		</div>
	</DemoBlock>
</template>
