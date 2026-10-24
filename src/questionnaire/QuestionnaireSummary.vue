<script setup lang="ts">
import { formatAskUserAnswer, type AskUserAnswer, type AskUserQuestion } from "./ask-user";

/** Read-only answers after submitting: one line per question, "Skipped" when left out. */
defineProps<{ title?: string; questions: AskUserQuestion[]; answers: Record<string, AskUserAnswer> }>();
</script>

<template>
	<section data-slot="questionnaire-summary" class="min-w-0 rounded-6 border border-outline-gray-2 bg-surface-base px-3 py-2.5" :aria-label="title || 'Your answers'">
		<div class="flex min-w-0 items-center gap-2">
			<span class="lucide-circle-check size-4 shrink-0 text-ink-green-6" aria-hidden="true" />
			<p class="min-w-0 flex-1 truncate text-sm-medium text-ink-gray-8">{{ title || "You answered" }}</p>
		</div>
		<dl class="mt-2 flex min-w-0 flex-col gap-1.5 pl-6">
			<div v-for="question in questions" :key="question.id" class="grid min-w-0 gap-x-3 gap-y-0.5 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
				<dt class="text-p-sm text-ink-gray-5 [overflow-wrap:anywhere]">{{ question.header || question.question }}</dt>
				<dd class="text-p-sm text-ink-gray-8 [overflow-wrap:anywhere]">
					<template v-if="formatAskUserAnswer(question, answers[question.id]) !== null">{{ formatAskUserAnswer(question, answers[question.id]) }}</template>
					<span v-else class="text-ink-gray-4">Skipped</span>
				</dd>
			</div>
		</dl>
	</section>
</template>
