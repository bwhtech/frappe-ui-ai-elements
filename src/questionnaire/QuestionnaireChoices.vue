<script setup lang="ts">
import { useQuestionnaireItem } from "./context";

/**
 * The answers of one item: a radio group, or a checkbox group when the item is
 * `multiple`. Arrow keys move between answers; in a radio group they also select.
 */
const item = useQuestionnaireItem("<QuestionnaireChoices>");

function move(event: KeyboardEvent, step: number) {
	const group = event.currentTarget as HTMLElement;
	const targets = Array.from(group.querySelectorAll<HTMLElement>("[data-slot=questionnaire-choice]:not([aria-disabled=true]), [data-slot=questionnaire-input] input:not(:disabled)"));
	const current = targets.findIndex((target) => target === event.target || target.contains(event.target as Node));
	const input = event.target instanceof HTMLInputElement ? event.target : null;
	// Inside the freeform text, arrows only leave it while it is empty.
	if (input && input.value !== "") return;
	const next = targets[(current + step + targets.length) % targets.length];
	if (!next) return;
	event.preventDefault();
	next.focus();
	if (!item.multiple.value && next.dataset.slot === "questionnaire-choice") next.click();
}
</script>

<template>
	<div
		data-slot="questionnaire-choices"
		:role="item.multiple.value ? 'group' : 'radiogroup'"
		:aria-labelledby="item.ids.title"
		:aria-required="item.required.value || undefined"
		:aria-disabled="item.disabled.value || undefined"
		class="flex min-w-0 flex-col gap-1"
		@keydown.up="move($event, -1)"
		@keydown.down="move($event, 1)"
	>
		<slot />
	</div>
</template>
