<script setup lang="ts">
import { Badge, Button } from "frappe-ui";
import { computed, onBeforeUnmount, onMounted, watch } from "vue";
import {
	Conversation,
	ConversationContent,
	ConversationEmptyState,
	ConversationItem,
	ConversationScrollButton,
	Loader,
	Message,
	MessageContent,
	MessageParts,
	PromptInput,
	PromptInputFooter,
	PromptInputSubmit,
	PromptInputTextarea,
	Suggestion,
	Suggestions,
} from "@bwhtech/frappe-ui-ai-elements";
import { useLog } from "../log";
import type { Values } from "../types";
import { ScenarioPlayer } from "../scenario/player";
import { scenarioSuggestions, type ScenarioBranch } from "../scenario/script";

const props = defineProps<{ v: Values; worst: boolean }>();
const log = useLog();
const player = new ScenarioPlayer(
	() => ({ speed: Number(props.v.speed), branch: props.v.branch as ScenarioBranch, text: props.worst ? "worst" : "normal" }),
	log,
);
const { messages, status, playing, finished, step, waiting } = player;

const busy = computed(() => status.value === "submitted" || status.value === "streaming");
const last = computed(() => messages.value[messages.value.length - 1]);
const statusTheme = computed(() => ({ ready: "gray", submitted: "amber", streaming: "blue", error: "red" } as const)[status.value]);

function answer(approved: boolean, approvalId: string) {
	log(approved ? "approve" : "deny", approvalId);
	player.respond(approved);
}

onMounted(() => props.v.autoplay && player.play());
// The branch and the text are read when a run starts, so a change replays the turn.
watch([() => props.v.branch, () => props.worst], () => messages.value.length && player.restart());
onBeforeUnmount(() => player.dispose());
</script>

<template>
	<div class="flex flex-col gap-3">
		<div class="flex flex-wrap items-center gap-2">
			<Button
				size="sm"
				variant="solid"
				:icon-left="waiting ? 'lucide-hand' : playing ? 'lucide-pause' : 'lucide-play'"
				:label="waiting ? 'Your turn' : playing ? 'Pause' : finished ? 'Replay' : 'Play'"
				:disabled="waiting"
				@click="playing ? player.pause() : player.play()"
			/>
			<Button size="sm" icon-left="lucide-rotate-ccw" label="Restart" @click="player.restart()" />
			<Badge :theme="statusTheme" size="sm" :label="`status: ${status}`" />
			<span class="min-w-0 truncate text-sm text-ink-gray-5" aria-live="polite">{{ step }}</span>
		</div>
		<div class="flex h-[560px] flex-col overflow-hidden rounded-6 border border-outline-gray-1 bg-surface-base">
			<div class="relative min-h-0 flex-1">
				<ConversationEmptyState v-if="!messages.length" icon="lucide-play" title="Press Play" description="A scripted Seva turn streams through the real components. No model, no network." />
				<Conversation v-else>
					<ConversationContent class="mx-auto w-full max-w-[720px] px-4 py-5">
						<ConversationItem v-for="message in messages" :key="message.id" :message-id="message.id" :scroll-anchor="message.role === 'user'">
							<Message :from="message.role">
								<MessageContent>
									<MessageParts
										:message="message"
										:streaming="busy && message === last"
										@approve="answer(true, $event)"
										@deny="answer(false, $event)"
									/>
								</MessageContent>
							</Message>
						</ConversationItem>
						<ConversationItem v-if="status === 'submitted' && last?.role === 'user'"><Loader /></ConversationItem>
					</ConversationContent>
					<ConversationScrollButton />
				</Conversation>
			</div>
			<div class="space-y-2 px-4 pb-4">
				<Suggestions v-if="finished">
					<Suggestion v-for="s in scenarioSuggestions" :key="s" :suggestion="s" @select="log('suggestion', $event)" />
				</Suggestions>
				<PromptInput :status="status" @submit="log('submit', $event.text)" @stop="log('stop'); player.pause()">
					<PromptInputTextarea placeholder="The script drives this thread. Typing only logs." />
					<PromptInputFooter><span /><PromptInputSubmit /></PromptInputFooter>
				</PromptInput>
			</div>
		</div>
	</div>
</template>
