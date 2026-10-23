<script setup lang="ts">
import { Select, Slider, Switch, TabButtons, TextInput, Textarea } from "frappe-ui";
import { computed } from "vue";
import type { Control, Option, Value } from "./types";

/** One knob, drawn with the frappe-ui control that fits its type. */
const props = defineProps<{ control: Control }>();
const model = defineModel<Value>({ required: true });

const options = computed(() =>
	"options" in props.control ? props.control.options.map((option: Option) => (typeof option === "string" ? { label: option, value: option } : option)) : [],
);
// A segment whose labels would truncate in the narrow panel falls back to a Select.
const fits = computed(() => props.control.type === "segment" && options.value.reduce((sum, option) => sum + option.label.length + 3, 0) <= 30);
const text = computed({ get: () => String(model.value), set: (value: string) => (model.value = value) });
const flag = computed({ get: () => model.value === true, set: (value: boolean) => (model.value = value) });
const range = computed({ get: () => [Number(model.value)], set: (value: number[] | undefined) => (model.value = value?.[0] ?? 0) });
const selected = computed({ get: () => String(model.value), set: (value: string | number | null) => (model.value = String(value ?? "")) });
</script>

<template>
	<div class="space-y-1.5">
		<Switch v-if="control.type === 'boolean'" v-model="flag" :label="control.label" />
		<template v-else>
			<div class="flex items-center justify-between gap-2">
				<span class="text-sm text-ink-gray-6">{{ control.label }}</span>
				<span v-if="control.type === 'range'" class="text-xs tabular-nums text-ink-gray-5">{{ model }}{{ control.unit ?? "" }}</span>
			</div>
			<Select v-if="control.type === 'select' || (control.type === 'segment' && !fits)" v-model="selected" :options="options" :aria-label="control.label" class="w-full" />
			<TabButtons v-else-if="control.type === 'segment'" v-model="selected" :options="options" fluid />
			<TextInput v-else-if="control.type === 'text'" v-model="text" :aria-label="control.label" />
			<Textarea v-else-if="control.type === 'textarea'" v-model="text" :rows="3" :aria-label="control.label" />
			<Slider v-else-if="control.type === 'range'" v-model="range" :min="control.min" :max="control.max" :step="control.step ?? 1" :aria-label="control.label" />
		</template>
	</div>
</template>
