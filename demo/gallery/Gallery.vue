<script setup lang="ts">
import { navigate } from "../navigate";
import { Button, FrappeUIProvider, useColorScheme } from "frappe-ui";
import ChatSection from "./sections/ChatSection.vue";
import MessageSection from "./sections/MessageSection.vue";
import PromptInputSection from "./sections/PromptInputSection.vue";
import ToolSection from "./sections/ToolSection.vue";
import QuestionnaireSection from "./sections/QuestionnaireSection.vue";
import DeskCardSection from "./sections/DeskCardSection.vue";
import ReasoningSection from "./sections/ReasoningSection.vue";
import FeedbackSection from "./sections/FeedbackSection.vue";
import CodeSection from "./sections/CodeSection.vue";
import StepsSection from "./sections/StepsSection.vue";
import DevSection from "./sections/DevSection.vue";
import MetaSection from "./sections/MetaSection.vue";

const { resolvedColorScheme, toggleColorScheme } = useColorScheme();

const nav = [
	["chat", "Chat"],
	["message", "Message & Response"],
	["prompt-input", "Prompt Input"],
	["tool", "Tool & Confirmation"],
	["questionnaire", "Questionnaire"],
	["desk-card", "Desk Card"],
	["reasoning", "Reasoning"],
	["feedback", "Shimmer, Loader, Suggestion"],
	["code-block", "Code Block"],
	["steps", "Task, Plan, Queue, Chain of Thought"],
	["dev", "Terminal, Stack Trace, Tests, Files, Subagent"],
	["meta", "Sources, Citation, Context, Model, Checkpoint"],
];
</script>

<template>
	<FrappeUIProvider>
		<div class="min-h-screen bg-surface-base text-ink-gray-8">
			<header class="sticky top-0 z-20 flex min-h-12 items-center gap-3 border-b border-outline-gray-1 bg-surface-base/90 px-3 backdrop-blur sm:px-5">
				<span class="lucide-sparkles size-4 text-ink-gray-6" aria-hidden="true" />
				<h1 class="text-base-semibold text-ink-gray-9">AI Elements</h1>
				<span class="hidden text-sm text-ink-gray-5 sm:inline">Vue on frappe-ui · fixture data, no model calls</span>
				<div class="ml-auto flex items-center gap-1">
					<Button variant="ghost" icon-left="lucide-flask-conical" label="Playground" @click="navigate('/playground.html')" />
					<Button
						variant="ghost"
						:icon="resolvedColorScheme === 'dark' ? 'lucide-sun' : 'lucide-moon'"
						aria-label="Toggle dark mode"
						@click="toggleColorScheme"
					/>
				</div>
			</header>
			<div class="mx-auto flex max-w-[1180px] gap-8 px-3 sm:px-5">
				<nav class="sticky top-16 hidden h-fit w-56 shrink-0 space-y-0.5 pt-5 lg:block">
					<a
						v-for="[id, label] in nav"
						:key="id"
						:href="`#${id}`"
						class="flex min-h-7 items-center rounded-4 px-2 py-1 text-sm leading-tight text-ink-gray-6 hover:bg-surface-gray-2 hover:text-ink-gray-8"
						>{{ label }}</a
					>
				</nav>
				<main class="min-w-0 max-w-[860px] flex-1 space-y-12 pb-40 pt-5">
					<ChatSection />
					<MessageSection />
					<PromptInputSection />
					<ToolSection />
					<QuestionnaireSection />
					<DeskCardSection />
					<ReasoningSection />
					<FeedbackSection />
					<CodeSection />
					<StepsSection />
					<DevSection />
					<MetaSection />
				</main>
			</div>
		</div>
	</FrappeUIProvider>
</template>
