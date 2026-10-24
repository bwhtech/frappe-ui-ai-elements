<script setup lang="ts">
import { useQuestionnaireItem } from "./context";

/** The question. Names its item's fieldset. */
defineProps<{ title?: string }>();
const item = useQuestionnaireItem("<QuestionnaireTitle>");
</script>

<template>
	<p :id="item.ids.title" data-slot="questionnaire-title" class="text-p-base-medium text-ink-gray-9 [overflow-wrap:anywhere]">
		<slot>{{ title }}</slot>
		<span v-if="item.required.value" class="sr-only"> (required)</span>
	</p>
</template>
