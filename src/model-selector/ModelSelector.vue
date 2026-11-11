<script setup lang="ts">
import { Button, Combobox } from "frappe-ui";
import { computed } from "vue";

export interface ModelOption {
	id: string;
	name: string;
	/** Groups the menu by provider, e.g. "Anthropic". */
	provider?: string;
	description?: string;
}

/** Picks one option, the model, from a list grouped by provider. `v-model` is the option id. */
const props = withDefaults(defineProps<{ models: ModelOption[]; label?: string }>(), { label: "Model" });
const model = defineModel<string>();

const current = computed(() => props.models.find((option) => option.id === model.value));
const toOption = (option: ModelOption) => ({ label: option.name, value: option.id, description: option.description });
const options = computed(() => {
	const providers = [...new Set(props.models.map((option) => option.provider))];
	if (providers.length <= 1) return props.models.map(toOption);
	return providers.map((provider) => ({
		group: provider ?? "Other",
		options: props.models.filter((option) => option.provider === provider).map(toOption),
	}));
});
// The list scrolls inside a fixed height, so a long one never runs off the screen. On a touch
// screen there is no search box: its focus would open the keyboard over half the list.
const touch = matchMedia("(pointer: coarse)").matches;
</script>

<template>
	<Combobox
		:model-value="model ?? null"
		:options="options"
		side="top"
		align="start"
		:hide-search="touch"
		placeholder="Find a model"
		@update:model-value="(value) => value != null && (model = String(value))"
	>
		<template #trigger>
			<Button
				variant="ghost"
				size="sm"
				icon-right="lucide-chevron-down"
				:aria-label="`${label}: ${current?.name ?? 'none'}`"
				class="min-w-0 max-w-full !text-ink-gray-6 hover:!text-ink-gray-8 relative after:absolute after:inset-0 after:content-[''] [@media(pointer:coarse)]:after:-inset-y-2"
			>
				{{ current?.name ?? label }}
			</Button>
		</template>
	</Combobox>
</template>
