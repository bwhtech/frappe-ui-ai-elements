<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import ChoiceIndicator from "./ChoiceIndicator.vue";
import { injectQuestionnaire, shortcutLabel, useQuestionnaireItem } from "./context";
import ShortcutHint from "./ShortcutHint.vue";

/**
 * One fixed answer, as a row: its shortcut key, label and description, and a
 * radio or checkbox mark. The default slot replaces the label and description.
 */
const props = defineProps<{ value: string; label?: string; description?: string; disabled?: boolean }>();

const root = injectQuestionnaire("QuestionnaireChoice");
const item = useQuestionnaireItem("<QuestionnaireChoice>");
const element = ref<HTMLElement | null>(null);

const checked = computed(() => item.isChecked(props.value));
const disabled = computed(() => props.disabled || item.disabled.value);
const index = computed(() => item.choiceIndex(props.value));
const shortcut = computed(() => shortcutLabel(root.shortcuts.value, index.value));
// Roving focus in a radio group: one tab stop, on the checked row or the first.
const tabindex = computed(() => {
	if (disabled.value) return -1;
	if (item.multiple.value) return 0;
	const anyChecked = item.value.value !== undefined && item.value.value !== null && !item.other.selected.value;
	return checked.value || (!anyChecked && !item.other.selected.value && index.value === 0) ? 0 : -1;
});

onBeforeUnmount(item.registerChoice(props.value, activate));

function activate() {
	if (disabled.value) return;
	item.select(props.value);
	element.value?.focus();
}
</script>

<template>
	<div
		ref="element"
		data-slot="questionnaire-choice"
		:data-state="checked ? 'checked' : 'unchecked'"
		:data-disabled="disabled || undefined"
		:role="item.multiple.value ? 'checkbox' : 'radio'"
		:aria-checked="checked"
		:aria-disabled="disabled || undefined"
		:aria-keyshortcuts="shortcut"
		:tabindex="tabindex"
		class="flex min-h-10 min-w-0 cursor-pointer select-none items-start gap-3 rounded-5 px-2.5 py-2 outline-offset-0 transition-colors hover:bg-surface-gray-2 data-[disabled]:cursor-not-allowed data-[state=checked]:bg-surface-gray-2 data-[disabled]:opacity-50 data-[disabled]:hover:bg-transparent motion-reduce:transition-none"
		@click="activate"
		@keydown.space.prevent="activate"
	>
		<ShortcutHint :label="shortcut" :checked="checked" />
		<span class="flex min-w-0 flex-1 flex-col gap-0.5 pt-px [overflow-wrap:anywhere]">
			<slot :checked="checked">
				<span class="text-p-base-medium text-ink-gray-8">{{ label ?? value }}</span>
				<span v-if="description" class="text-p-sm text-ink-gray-5">{{ description }}</span>
			</slot>
		</span>
		<ChoiceIndicator :checked="checked" :multiple="item.multiple.value" />
	</div>
</template>
