<script setup lang="ts">
import { Button, Dropdown } from "frappe-ui";
import { computed } from "vue";

export interface ModelOption {
	id: string;
	name: string;
	/** Groups the menu by provider, e.g. "Anthropic". */
	provider?: string;
	description?: string;
}

/** A menu that picks one option: the model, or how hard it thinks. `v-model` is the option id. */
const props = withDefaults(defineProps<{ models: ModelOption[]; label?: string }>(), { label: "Model" });
const model = defineModel<string>();

const current = computed(() => props.models.find((option) => option.id === model.value));
const options = computed(() => {
	const toItem = (option: ModelOption) => ({
		label: option.name,
		description: option.description,
		selected: option.id === model.value,
		onClick: () => (model.value = option.id),
	});
	const providers = [...new Set(props.models.map((option) => option.provider))];
	if (providers.length <= 1) return props.models.map(toItem);
	return providers.map((provider) => ({
		group: provider ?? "Other",
		options: props.models.filter((option) => option.provider === provider).map(toItem),
	}));
});
</script>

<template>
	<Dropdown :options="options" side="top" align="start">
		<Button variant="ghost" size="sm" icon-right="lucide-chevron-down" :aria-label="`${label}: ${current?.name ?? 'none'}`" class="min-w-0 max-w-full text-ink-gray-6">
			{{ current?.name ?? label }}
		</Button>
	</Dropdown>
</template>
