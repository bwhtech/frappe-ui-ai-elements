<script setup lang="ts">
import { ErrorMessage } from "frappe-ui";
import { useQuestionnaireItem } from "./context";

/** Shown when the person tries to move on without answering a required item. */
withDefaults(defineProps<{ message?: string }>(), { message: "Answer this question to continue." });
const item = useQuestionnaireItem("<QuestionnaireError>");
</script>

<template>
	<ErrorMessage :id="item.ids.error" data-slot="questionnaire-error" :message="item.invalid.value ? message : ''" />
</template>
