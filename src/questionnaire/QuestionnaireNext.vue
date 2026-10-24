<script setup lang="ts">
import { Button } from "frappe-ui";
import { useQuestionnaireNav } from "./nav";

/** Validates the active item and moves on. Hidden on the last item, where Submit takes its place. */
withDefaults(defineProps<{ label?: string }>(), { label: "Next" });
const { root, last, status } = useQuestionnaireNav("QuestionnaireNext");
</script>

<template>
	<Button
		v-if="!last"
		data-slot="questionnaire-next"
		:data-status="status"
		size="sm"
		variant="solid"
		icon-right="lucide-arrow-right"
		:label="label"
		:disabled="root.disabled.value"
		@click="root.next()"
	/>
</template>
