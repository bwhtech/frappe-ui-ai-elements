<script setup lang="ts">
import { Button } from "frappe-ui";
import { useQuestionnaireNav } from "./nav";

/** Leaves an optional item unanswered on purpose and moves on (submits on the last item). Hidden on required items. */
withDefaults(defineProps<{ label?: string }>(), { label: "Skip" });
const { root, optional, status } = useQuestionnaireNav("QuestionnaireSkip");
</script>

<template>
	<Button
		v-if="optional"
		data-slot="questionnaire-skip"
		:data-status="status"
		size="sm"
		variant="ghost"
		:label="label"
		:disabled="root.disabled.value"
		@click="root.skip()"
	/>
</template>
