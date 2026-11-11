<script setup lang="ts">
import type { ToolUIPart } from "ai";
import { ref } from "vue";
import {
	Questionnaire,
	QuestionnaireActions,
	QuestionnaireChoice,
	QuestionnaireChoices,
	QuestionnaireError,
	QuestionnaireItem,
	QuestionnaireSubmit,
	QuestionnaireSummary,
	QuestionnaireTitle,
	ToolPart,
	type AskUserOutput,
	type AskUserQuestion,
	type QuestionnaireSubmitPayload,
} from "frappe-ui-ai-elements";
import DemoBlock from "../DemoBlock.vue";
import { volunteerAnswers, volunteerQuestions } from "../fixtures";

const nameChoices = [
	{ value: "Volunteer", label: "Volunteer", description: "The usual word for it" },
	{ value: "Sevak", label: "Sevak", description: "What your team calls them" },
];
const nameQuestion: AskUserQuestion = { id: "name", question: "What should the list be called?", kind: "single", options: nameChoices };
const picked = ref<QuestionnaireSubmitPayload | null>(null);
const answered = ref<AskUserOutput | null>(null);

const part = { type: "tool-ask_user", toolCallId: "call-ask-1", state: "input-available", input: volunteerQuestions } as unknown as ToolUIPart;
const done = { ...part, toolCallId: "call-ask-2", state: "output-available", output: volunteerAnswers } as unknown as ToolUIPart;
</script>

<template>
	<DemoBlock
		id="questionnaire"
		title="Questionnaire"
		part="tool-ask_user"
		description="The agent asks, the person answers. One question, composed from the parts: press 1 or 2, then Enter."
	>
		<QuestionnaireSummary v-if="picked" :questions="[nameQuestion]" :answers="{ name: (picked.answers.name as string) ?? null }" />
		<Questionnaire v-else @submit="picked = $event">
			<QuestionnaireItem name="name" required>
				<QuestionnaireTitle>{{ nameQuestion.question }}</QuestionnaireTitle>
				<QuestionnaireChoices>
					<QuestionnaireChoice v-for="choice in nameChoices" :key="choice.value" v-bind="choice" />
				</QuestionnaireChoices>
				<QuestionnaireError />
			</QuestionnaireItem>
			<QuestionnaireActions><QuestionnaireSubmit label="Send answer" /></QuestionnaireActions>
		</Questionnaire>
		<button v-if="picked" type="button" class="mt-2 text-sm text-ink-gray-5 underline underline-offset-2 hover:text-ink-gray-8" @click="picked = null">Ask again</button>
	</DemoBlock>

	<DemoBlock
		id="questionnaire-ask-user"
		title="Questionnaire, from ask_user"
		description="ToolPart renders an ask_user call in input-available as a step-by-step Questionnaire, then a summary. Below it, the same call once its output is in."
	>
		<div class="flex flex-col gap-3">
			<ToolPart :part="part" :streaming="false" @answer="answered = $event.output" />
			<p class="text-sm text-ink-gray-5">
				Output: <code class="font-mono text-xs text-ink-gray-8 [overflow-wrap:anywhere]">{{ answered ? JSON.stringify(answered) : "—" }}</code>
			</p>
			<ToolPart :part="done" :streaming="false" />
		</div>
	</DemoBlock>
</template>
