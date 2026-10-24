<script setup lang="ts">
import { useQuestionnaireItem } from "./context";

defineProps<{ description?: string }>();
const item = useQuestionnaireItem("<QuestionnaireDescription>");
</script>

<template>
	<p :id="item.ids.description" data-slot="questionnaire-description" class="-mt-2 text-p-sm text-ink-gray-5 [overflow-wrap:anywhere]">
		<slot>{{ description }}</slot>
	</p>
</template>
