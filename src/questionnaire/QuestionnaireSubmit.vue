<script setup lang="ts">
import { Button } from "frappe-ui";
import { useQuestionnaireNav } from "./nav";

/** Validates every item and submits. Shown on the last item. */
withDefaults(defineProps<{ label?: string }>(), { label: "Submit" });
const { root, last, status } = useQuestionnaireNav("QuestionnaireSubmit");
</script>

<template>
	<Button
		v-if="last"
		data-slot="questionnaire-submit"
		:data-status="status"
		size="sm"
		variant="solid"
		type="submit"
		:label="label"
		:disabled="root.disabled.value"
	/>
</template>
