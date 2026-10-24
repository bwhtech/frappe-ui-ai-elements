<script setup lang="ts">
import { Combobox, DatePicker, MultiSelect, Select, Switch, TextInput } from "frappe-ui";
import { computed, onMounted, ref } from "vue";
import { controlFor, type AskUserQuestion } from "./ask-user";
import { useQuestionnaireItem } from "./context";
import QuestionnaireChoice from "./QuestionnaireChoice.vue";
import QuestionnaireChoices from "./QuestionnaireChoices.vue";
import QuestionnaireInput from "./QuestionnaireInput.vue";

/** The control for one ask_user question, picked by its kind and option count. */
const props = defineProps<{ question: AskUserQuestion }>();
const item = useQuestionnaireItem("<AskUserControl>");

const control = computed(() => controlFor(props.question));
const options = computed(() => (props.question.options ?? []).map(({ value, label, description }) => ({ value, label, description })));
const disabled = computed(() => item.disabled.value);

const text = computed({
	get: () => (typeof item.value.value === "string" || typeof item.value.value === "number" ? item.value.value : ""),
	set: (value: string | number) => (item.value.value = props.question.kind === "number" ? toNumber(value) : String(value)),
});
// A picked option clears the "Other" text, so the picker and the text never disagree.
const picked = computed({
	get: () => (!item.other.selected.value && typeof item.value.value === "string" ? item.value.value : null),
	set: (value: string | number | null) => (value === null ? (item.value.value = undefined) : item.select(String(value))),
});
const pickedMany = computed({
	get: () => (Array.isArray(item.value.value) ? item.value.value.filter((value) => options.value.some((option) => option.value === value)) : []),
	set: (values: (string | number)[]) => {
		const other = item.other.selected.value && item.other.text.value.trim() ? [item.other.text.value] : [];
		item.value.value = [...values.map(String), ...other];
	},
});
const pickers = ref<HTMLElement | null>(null);
const flag = computed({ get: () => item.value.value === true, set: (value: boolean) => (item.value.value = value) });

// A switch always has an answer: off means No.
onMounted(() => props.question.kind === "boolean" && item.value.value === undefined && (item.value.value = false));

// A picker that closes with focus nowhere (Escape after picking) would strand the keyboard: return it to the trigger.
function keepFocus(open: boolean) {
	if (open) return;
	// After the popup's exit transition, which is when focus actually drops.
	setTimeout(() => {
		if (document.activeElement === document.body) pickers.value?.querySelector<HTMLElement>("button, input")?.focus();
	}, 200);
}

function toNumber(value: string | number) {
	if (value === "" || value === null) return undefined;
	const number = Number(value);
	return Number.isFinite(number) ? number : undefined;
}
</script>

<template>
	<QuestionnaireChoices v-if="control === 'rows'">
		<QuestionnaireChoice v-for="option in options" :key="option.value" :value="option.value" :label="option.label" :description="option.description" />
		<QuestionnaireInput v-if="question.allowOther" :placeholder="question.placeholder || 'Other…'" />
	</QuestionnaireChoices>
	<div v-else-if="control === 'select' || control === 'combobox' || control === 'multiselect'" ref="pickers" class="flex min-w-0 flex-col gap-2">
		<Select v-if="control === 'select'" class="w-full" v-model="picked" :options="options" :disabled="disabled" placeholder="Choose one" :aria-labelledby="item.ids.title" @update:open="keepFocus" />
		<Combobox v-else-if="control === 'combobox'" class="w-full" v-model="picked" :options="options" :disabled="disabled" placeholder="Search or choose" :aria-labelledby="item.ids.title" @update:open="keepFocus" />
		<MultiSelect v-else class="w-full" v-model="pickedMany" :options="options" :disabled="disabled" placeholder="Choose any" :aria-labelledby="item.ids.title" @update:open="keepFocus" />
		<QuestionnaireChoices v-if="question.allowOther">
			<QuestionnaireInput :placeholder="question.placeholder || 'Other…'" />
		</QuestionnaireChoices>
	</div>
	<TextInput
		v-else-if="control === 'text' || control === 'number'"
		v-model="text"
		:type="control === 'number' ? 'number' : 'text'"
		:placeholder="question.placeholder"
		:disabled="disabled"
		:aria-labelledby="item.ids.title"
		:aria-invalid="item.invalid.value || undefined"
	/>
	<DatePicker
		v-else-if="control === 'date'"
		:model-value="typeof item.value.value === 'string' ? item.value.value : ''"
		:placeholder="question.placeholder || 'Pick a date'"
		:disabled="disabled"
		:aria-labelledby="item.ids.title"
		@update:model-value="item.value.value = $event || undefined"
	/>
	<Switch v-else-if="control === 'boolean'" v-model="flag" :label="flag ? 'Yes' : 'No'" :disabled="disabled" :aria-labelledby="item.ids.title" />
</template>
