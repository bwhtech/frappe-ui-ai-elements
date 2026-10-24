<script setup lang="ts">
import { TextInput } from "frappe-ui";
import { computed, onBeforeUnmount, ref } from "vue";
import ChoiceIndicator from "./ChoiceIndicator.vue";
import { injectQuestionnaire, shortcutLabel, useQuestionnaireItem } from "./context";
import { OTHER_KEY } from "./item";
import ShortcutHint from "./ShortcutHint.vue";

/**
 * A freeform answer after the fixed choices: "Other…". Typing selects it; in a
 * single item it replaces the fixed choice. Escape returns focus to the choices.
 */
withDefaults(defineProps<{ placeholder?: string; label?: string }>(), { placeholder: "Other…", label: "Other answer" });

const root = injectQuestionnaire("QuestionnaireInput");
const item = useQuestionnaireItem("<QuestionnaireInput>");
const input = ref<InstanceType<typeof TextInput> | null>(null);
const row = ref<HTMLElement | null>(null);

const checked = computed(() => item.other.selected.value);
const shortcut = computed(() => shortcutLabel(root.shortcuts.value, item.choiceIndex(OTHER_KEY)));

onBeforeUnmount(item.registerChoice(OTHER_KEY, activate));

function activate() {
	if (item.disabled.value) return;
	if (!item.multiple.value || !checked.value || !item.other.text.value) item.other.choose();
	input.value?.focus();
}

function backToChoices() {
	row.value?.closest("[data-slot=questionnaire-choices]")?.querySelector<HTMLElement>("[data-slot=questionnaire-choice]")?.focus();
}
</script>

<template>
	<div
		ref="row"
		data-slot="questionnaire-input"
		:data-state="checked ? 'checked' : 'unchecked'"
		:data-disabled="item.disabled.value || undefined"
		class="flex min-w-0 items-center gap-3 rounded-5 px-2.5 py-1.5 transition-colors data-[state=checked]:bg-surface-gray-2 data-[disabled]:opacity-50 motion-reduce:transition-none"
		@click.self="activate"
	>
		<ShortcutHint :label="shortcut" :checked="checked" />
		<TextInput
			ref="input"
			class="min-w-0 flex-1"
			:model-value="item.other.text.value"
			:placeholder="placeholder"
			:aria-label="label"
			:aria-keyshortcuts="shortcut"
			:disabled="item.disabled.value"
			@update:model-value="item.other.set(String($event ?? ''))"
			@keydown.esc="backToChoices"
		/>
		<ChoiceIndicator :checked="checked" :multiple="item.multiple.value" />
	</div>
</template>
