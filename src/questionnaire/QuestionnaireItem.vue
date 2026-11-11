<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId } from "vue";
import { injectQuestionnaire, provideQuestionnaireItem } from "./context";
import { useItemAnswer } from "./item";

/**
 * One question: a fieldset that shows only while it is the active step.
 * `name` keys its answer; `multiple` makes its choices checkboxes.
 */
const props = withDefaults(defineProps<{ name: string; required?: boolean; multiple?: boolean; disabled?: boolean }>(), {
	required: false,
	multiple: false,
	disabled: false,
});

const root = injectQuestionnaire("QuestionnaireItem");
const element = ref<HTMLFieldSetElement | null>(null);
const id = useId();
const ids = { title: `${id}-title`, description: `${id}-description`, error: `${id}-error` };

const active = computed(() => root.activeName.value === props.name);
const invalid = computed(() => root.invalidName.value === props.name);
const answer = useItemAnswer(
	root,
	() => props.name,
	() => props.multiple,
);

const context = {
	name: props.name,
	multiple: computed(() => props.multiple),
	required: computed(() => props.required),
	disabled: computed(() => props.disabled || root.disabled.value),
	active,
	invalid,
	status: computed(() => root.statusOf(props.name)),
	ids,
	value: answer.value,
	registerChoice: answer.registerChoice,
	choiceIndex: answer.choiceIndex,
	isChecked: answer.isChecked,
	select: answer.select,
	other: answer.other,
};
provideQuestionnaireItem(context);

const unregister = root.register({
	name: props.name,
	element,
	required: () => props.required,
	disabled: () => props.disabled,
	focus,
	pick: (index) => answer.activate(index),
});
onBeforeUnmount(unregister);

/** Focus the checked answer, else the first focusable control. */
function focus() {
	const fieldset = element.value;
	if (!fieldset) return;
	const target =
		fieldset.querySelector<HTMLElement>("[data-slot=questionnaire-choice][aria-checked=true]") ??
		fieldset.querySelector<HTMLElement>("[data-slot=questionnaire-choice], input, button, [tabindex]:not([tabindex='-1'])");
	target?.focus();
}
</script>

<template>
	<fieldset
		v-show="active"
		ref="element"
		data-slot="questionnaire-item"
		:data-state="active ? 'active' : 'inactive'"
		:data-status="context.status.value"
		:data-invalid="invalid || undefined"
		:data-disabled="context.disabled.value || undefined"
		:aria-labelledby="ids.title"
		:aria-describedby="ids.description"
		:aria-invalid="invalid || undefined"
		:aria-errormessage="invalid ? ids.error : undefined"
		class="m-0 flex min-w-0 flex-col gap-3 border-0 p-0"
	>
		<slot :active="active" :status="context.status.value" :invalid="invalid" />
	</fieldset>
</template>
