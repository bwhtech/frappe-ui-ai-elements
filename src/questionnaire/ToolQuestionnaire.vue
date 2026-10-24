<script setup lang="ts">
import { Button } from "frappe-ui";
import { computed, ref } from "vue";
import { isRequired, toAskUserOutput, type AskUserInput, type AskUserOutput } from "./ask-user";
import AskUserControl from "./AskUserControl.vue";
import type { QuestionnaireAnswers, QuestionnaireSubmitPayload } from "./context";
import Questionnaire from "./Questionnaire.vue";
import QuestionnaireActions from "./QuestionnaireActions.vue";
import QuestionnaireDescription from "./QuestionnaireDescription.vue";
import QuestionnaireError from "./QuestionnaireError.vue";
import QuestionnaireItem from "./QuestionnaireItem.vue";
import QuestionnaireNext from "./QuestionnaireNext.vue";
import QuestionnairePrevious from "./QuestionnairePrevious.vue";
import QuestionnaireProgress from "./QuestionnaireProgress.vue";
import QuestionnaireSkip from "./QuestionnaireSkip.vue";
import QuestionnaireSubmit from "./QuestionnaireSubmit.vue";
import QuestionnaireSummary from "./QuestionnaireSummary.vue";
import QuestionnaireTitle from "./QuestionnaireTitle.vue";

/**
 * A ready-made Questionnaire for an `ask_user` tool call. Steps through the
 * questions, then shows a read-only summary. Pass `output` once the answer is
 * in the chat; until then the summary uses the answers just submitted.
 */
const props = withDefaults(defineProps<{ input: AskUserInput; output?: AskUserOutput; disabled?: boolean }>(), { disabled: false });
const emit = defineEmits<{
	answer: [output: AskUserOutput];
	/** The person chose not to answer. Close the call with addToolOutput's `output-error` state. */
	dismiss: [];
}>();

const answers = ref<QuestionnaireAnswers>({});
const submitted = ref<AskUserOutput | null>(null);
const result = computed(() => props.output ?? submitted.value);
const single = computed(() => props.input.questions.length === 1);

function submit(payload: QuestionnaireSubmitPayload) {
	submitted.value = toAskUserOutput(props.input, payload);
	emit("answer", submitted.value);
}
</script>

<template>
	<QuestionnaireSummary v-if="result" :title="input.title" :questions="input.questions" :answers="result.answers" />
	<section
		v-else
		data-slot="tool-questionnaire"
		:data-disabled="disabled || undefined"
		class="min-w-0 rounded-6 border border-outline-gray-2 bg-surface-base p-3 shadow-sm sm:p-4"
		:aria-label="input.title || 'Questions from the agent'"
	>
		<Questionnaire v-model="answers" :disabled="disabled" @submit="submit">
			<div class="flex min-w-0 items-center gap-2">
				<span class="lucide-message-circle-question size-4 shrink-0 text-ink-gray-5" aria-hidden="true" />
				<p class="min-w-0 flex-1 truncate text-sm-medium text-ink-gray-6">{{ input.title || "A few questions before I start" }}</p>
				<QuestionnaireProgress v-if="!single" />
			</div>
			<QuestionnaireItem v-for="question in input.questions" :key="question.id" :name="question.id" :required="isRequired(question)" :multiple="question.kind === 'multiple'">
				<div class="flex min-w-0 flex-col gap-1">
					<p v-if="question.header" class="text-xs-medium text-ink-gray-5 [overflow-wrap:anywhere]">
						{{ question.header }}<span v-if="!isRequired(question)" class="text-xs text-ink-gray-4"> · optional</span>
					</p>
					<QuestionnaireTitle :title="question.question" />
				</div>
				<QuestionnaireDescription v-if="question.description" :description="question.description" />
				<AskUserControl :question="question" />
				<QuestionnaireError />
			</QuestionnaireItem>
			<QuestionnaireActions>
				<Button variant="ghost" label="Not now" :disabled="disabled" @click="emit('dismiss')" />
				<QuestionnairePrevious />
				<p v-if="disabled" class="mr-auto text-p-sm text-ink-gray-5">Waiting for the reply to finish…</p>
				<QuestionnaireSkip />
				<QuestionnaireNext />
				<QuestionnaireSubmit :label="single ? 'Send answer' : 'Submit'" />
			</QuestionnaireActions>
		</Questionnaire>
	</section>
</template>
