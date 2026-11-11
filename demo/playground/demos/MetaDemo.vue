<script setup lang="ts">
import { computed, ref } from "vue";
import { Checkpoint, CheckpointIcon, CheckpointTrigger, Context, InlineCitation, ModelSelector, Sources } from "frappe-ui-ai-elements";
import { useLog } from "../log";
import type { Values } from "../types";
import { worst as w } from "../worst";

/** Sources, Inline Citation, Context, Model Selector and Checkpoint; `kind` picks which. */
const props = defineProps<{ v: Values; worst: boolean; kind: "sources" | "citation" | "context" | "model" | "checkpoint" }>();
const log = useLog();
const pool = [
	{ url: "https://docs.frappe.io/framework/user/en/basics/doctypes", title: "DocTypes · Frappe Framework docs" },
	{ url: "https://www.volunteermatch.org/nonprofits/resources", title: "Volunteer management resources" },
	{ url: "https://docs.frappe.io/framework/user/en/web-forms", title: "Web Forms" },
	{ url: "https://www.idealist.org/en/days/guide", title: "Running a volunteer day" },
];
const sources = computed(() =>
	Array.from({ length: Number(props.v.count) }, (_, i) => {
		const source = pool[i % pool.length];
		if (props.worst) return { url: `https://${w.unbroken.slice(0, 40)}.example.org/${i}`, title: i % 2 ? w.hindi : undefined };
		return {
			url: source.url,
			title: props.v.titles ? source.title : undefined,
			quote: props.v.quote ? "A DocType is the core building block of any Frappe application." : undefined,
		};
	}),
);
const model = ref("sonnet");
const models = computed(() => {
	const list = [
		{ id: "sonnet", name: props.worst ? w.name : "Claude Sonnet", provider: "Anthropic", description: "Balanced" },
		{ id: "opus", name: "Claude Opus", provider: "Anthropic", description: "Most capable" },
		{ id: "gpt", name: "GPT-5", provider: "OpenAI" },
	];
	return props.v.grouped ? list : list.map(({ provider: _, ...rest }) => rest);
});
const restored = ref(false);
</script>

<template>
	<Sources v-if="kind === 'sources'" :key="String(v.count)" :sources="sources" default-open />
	<p v-else-if="kind === 'citation'" class="text-p-base text-ink-gray-8">
		{{ worst ? w.hindi : "A DocType is the model and the form at once" }}<InlineCitation :sources="sources" />, and a web form lets people outside your team
		fill it in.
	</p>
	<div v-else-if="kind === 'context'" class="flex items-center gap-3">
		<Context
			:used-tokens="Number(v.used)"
			:max-tokens="Number(v.max)"
			:usage="
				v.breakdown
					? {
							inputTokens: Math.round(Number(v.used) * 0.8),
							cachedInputTokens: Math.round(Number(v.used) * 0.5),
							outputTokens: Math.round(Number(v.used) * 0.2),
						}
					: undefined
			"
			:model-id="worst ? w.toolName : 'anthropic/claude-sonnet-5.5'"
		/>
		<span class="text-sm text-ink-gray-5">Hover or focus the ring</span>
	</div>
	<ModelSelector v-else-if="kind === 'model'" v-model="model" :models="models" @update:model-value="log('update:modelValue', $event)" />
	<div v-else class="space-y-2">
		<Checkpoint>
			<CheckpointIcon />
			{{ worst ? w.unbroken : String(v.label) }}
			<CheckpointTrigger
				:tooltip="String(v.tooltip) || undefined"
				@click="
					restored = true;
					log('restore');
				"
			/>
		</Checkpoint>
		<p v-if="restored" class="text-sm text-ink-gray-5">Restored. Later turns would be removed.</p>
	</div>
</template>
