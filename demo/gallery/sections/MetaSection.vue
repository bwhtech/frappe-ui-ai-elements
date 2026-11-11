<script setup lang="ts">
import { ref } from "vue";
import { Checkpoint, CheckpointIcon, CheckpointTrigger, Context, InlineCitation, ModelSelector, Sources } from "frappe-ui-ai-elements";
import DemoBlock from "../DemoBlock.vue";

const sources = [
	{ url: "https://docs.frappe.io/framework/user/en/basics/doctypes", title: "DocTypes · Frappe Framework docs" },
	{ url: "https://www.volunteermatch.org/nonprofits/resources" },
	{ url: "https://docs.frappe.io/framework/user/en/web-forms", title: "Web Forms" },
];
const model = ref("sonnet");
const restored = ref("");
</script>

<template>
	<DemoBlock id="meta" title="Sources" part="source-url" description="The links the agent used, deduped by URL. Titles fall back to the hostname.">
		<Sources :sources="sources" default-open />
	</DemoBlock>
	<DemoBlock id="inline-citation" title="Inline Citation" description="A source chip inside the sentence that opens on hover or focus.">
		<p class="text-p-base text-ink-gray-8">
			A DocType is the model and the form at once<InlineCitation
				:sources="[{ ...sources[0], quote: 'A DocType is the core building block of any application based on the Frappe Framework.' }]"
			/>, and a web form lets people outside your team fill it in<InlineCitation :sources="[sources[2], sources[1]]" />.
		</p>
	</DemoBlock>
	<DemoBlock id="context" title="Context & Model Selector" description="Token usage of the thread, and the model menu.">
		<div class="flex flex-wrap items-center gap-3">
			<Context
				:used-tokens="12400"
				:max-tokens="200000"
				:usage="{ inputTokens: 10200, cachedInputTokens: 8000, outputTokens: 2200 }"
				model-id="anthropic/claude-sonnet-5.5"
			/>
			<Context :used-tokens="182000" :max-tokens="200000" />
			<ModelSelector
				v-model="model"
				:models="[
					{ id: 'sonnet', name: 'Claude Sonnet', provider: 'Anthropic', description: 'Balanced' },
					{ id: 'opus', name: 'Claude Opus', provider: 'Anthropic', description: 'Most capable' },
					{ id: 'gpt', name: 'GPT-5', provider: 'OpenAI' },
				]"
			/>
		</div>
	</DemoBlock>
	<DemoBlock id="checkpoint" title="Checkpoint" part="data-checkpoint" description="A point in the conversation you can return to.">
		<Checkpoint>
			<CheckpointIcon />
			Volunteer DocType created
			<CheckpointTrigger tooltip="Remove every later turn" @click="restored = 'Restored to: Volunteer DocType created'" />
		</Checkpoint>
		<p v-if="restored" class="mt-2 text-sm text-ink-gray-5">{{ restored }}</p>
	</DemoBlock>
</template>
