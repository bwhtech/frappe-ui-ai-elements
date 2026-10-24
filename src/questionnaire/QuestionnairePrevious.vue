<script setup lang="ts">
import { Button } from "frappe-ui";
import { useQuestionnaireNav } from "./nav";

/** Back to the previous item. Hidden on the first. */
withDefaults(defineProps<{ label?: string }>(), { label: "Back" });
const { root, first, status } = useQuestionnaireNav("QuestionnairePrevious");
</script>

<template>
	<Button
		v-if="!first"
		data-slot="questionnaire-previous"
		:data-status="status"
		size="sm"
		variant="ghost"
		icon-left="lucide-arrow-left"
		:label="label"
		:disabled="root.disabled.value"
		@click="root.previous()"
	/>
</template>
