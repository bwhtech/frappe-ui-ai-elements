<script setup lang="ts">
import { ref } from "vue";
import { provideQuestionnaire, type QuestionnaireAnswers, type QuestionnaireShortcuts, type QuestionnaireSubmitPayload } from "./context";
import { createQuestionnaire } from "./root";

/**
 * Asks one question at a time. Owns the active item, answers, skip marks,
 * validation and keyboard handling. A native form: Enter continues, the last
 * item submits. The host owns what happens after `submit`.
 */
const props = withDefaults(defineProps<{ disabled?: boolean; shortcuts?: QuestionnaireShortcuts }>(), {
	disabled: false,
	shortcuts: "numbers",
});
const emit = defineEmits<{ submit: [payload: QuestionnaireSubmitPayload] }>();
/** Answers keyed by item name. */
const answers = defineModel<QuestionnaireAnswers>({ default: () => ({}) });
/** The active item's name. Unset means the first enabled item. */
const item = defineModel<string>("item");

const element = ref<HTMLFormElement | null>(null);
const { context, onKeydown } = createQuestionnaire({
	answers,
	item,
	element,
	disabled: () => props.disabled,
	shortcuts: () => props.shortcuts,
	onSubmit: (payload) => emit("submit", payload),
});
provideQuestionnaire(context);
</script>

<template>
	<form
		ref="element"
		data-slot="questionnaire"
		:data-disabled="disabled || undefined"
		:aria-disabled="disabled || undefined"
		novalidate
		class="flex w-full min-w-0 flex-col gap-3"
		@submit.prevent="context.submit()"
		@keydown="onKeydown"
	>
		<slot :active-name="context.activeName.value" :active-index="context.activeIndex.value" :total="context.items.value.length" />
	</form>
</template>
