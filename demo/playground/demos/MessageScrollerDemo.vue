<script setup lang="ts">
import { Button } from "frappe-ui";
import { computed, onBeforeUnmount, ref } from "vue";
import {
	Loader,
	Message,
	MessageContent,
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerViewport,
	Response,
} from "frappe-ui-ai-elements";
import { useLog } from "../log";
import type { Values } from "../types";
import { worst as w } from "../worst";
import ScrollerReadout from "./ScrollerReadout.vue";

const props = defineProps<{ v: Values; worst: boolean }>();
const log = useLog();

interface Turn {
	id: string;
	role: "user" | "assistant";
	text: string;
}

const TOTAL = 60;
const history = computed<Turn[]>(() => Array.from({ length: TOTAL }, (_, i) => turn(i)));
const shown = ref(Number(props.v.initial));
const loading = ref(false);
const streamed = ref<Turn | null>(null);
const timers = new Set<ReturnType<typeof setTimeout>>();

const turns = computed(() => [...history.value.slice(TOTAL - shown.value), ...(streamed.value ? [streamed.value] : [])]);
const hasOlder = computed(() => shown.value < TOTAL);

function turn(i: number): Turn {
	const role = i % 2 ? "assistant" : "user";
	if (props.worst) return { id: `m${i}`, role, text: i % 2 ? `${w.marathi}\n\n\`${w.unbroken}\`` : `${w.hindi} ${w.emoji}` };
	const text =
		role === "user" ? `Question ${i}: which volunteers are free on day ${i}?` : `Answer ${i}: ${"Asha, Ravi and Meena are free. ".repeat(1 + (i % 4))}`;
	return { id: `m${i}`, role, text };
}

function later(ms: number, task: () => void) {
	const timer = setTimeout(() => {
		timers.delete(timer);
		task();
	}, ms);
	timers.add(timer);
}

function loadOlder() {
	if (loading.value || !hasOlder.value) return;
	loading.value = true;
	log("load-older", { before: turns.value[0]?.id });
	later(Number(props.v.delay), () => {
		shown.value = Math.min(TOTAL, shown.value + Number(props.v.batch));
		loading.value = false;
	});
}

function onReachStart() {
	log("reach-start");
	if (props.v.autoLoad) loadOlder();
}

// A reply that grows in place, to check that loading older rows does not jump while it streams.
function streamReply() {
	const words = "Here is the full roster for the weekend drive, grouped by area, with phone numbers and the shifts each volunteer picked.".split(" ");
	streamed.value = { id: "live", role: "assistant", text: "" };
	words.forEach((word, i) => later(120 * (i + 1), () => streamed.value && (streamed.value.text += `${word} `)));
}

onBeforeUnmount(() => timers.forEach(clearTimeout));
</script>

<template>
	<MessageScrollerProvider :key="`${v.autoScroll}`" :auto-scroll="Boolean(v.autoScroll)">
		<div class="flex flex-col gap-3">
			<div class="flex flex-wrap items-center gap-2">
				<Button size="sm" icon-left="lucide-history" label="Load older" :loading="loading" :disabled="!hasOlder" @click="loadOlder" />
				<Button size="sm" icon-left="lucide-play" label="Stream a reply" @click="streamReply" />
				<span class="text-sm tabular-nums text-ink-gray-5">{{ turns.length }} of {{ TOTAL + (streamed ? 1 : 0) }} rows</span>
			</div>
			<div class="h-[420px] overflow-hidden rounded-6 border border-outline-gray-1">
				<MessageScroller>
					<MessageScrollerViewport :preserve-scroll-on-prepend="Boolean(v.preserve)" @reach-start="onReachStart">
						<MessageScrollerContent class="px-4 py-5">
							<MessageScrollerItem v-if="hasOlder">
								<div class="flex justify-center">
									<Loader v-if="loading" text="Loading older messages…" />
									<Button v-else size="sm" variant="ghost" label="Load older messages" @click="loadOlder" />
								</div>
							</MessageScrollerItem>
							<MessageScrollerItem v-for="item in turns" :key="item.id" :message-id="item.id" :scroll-anchor="item.role === 'user'">
								<Message :from="item.role">
									<MessageContent>
										<template v-if="item.role === 'user'">{{ item.text }}</template>
										<Response v-else :content="`**${item.id}** ${item.text}`" />
									</MessageContent>
								</Message>
							</MessageScrollerItem>
						</MessageScrollerContent>
					</MessageScrollerViewport>
					<MessageScrollerButton />
				</MessageScroller>
			</div>
			<ScrollerReadout v-if="v.visibility" />
		</div>
	</MessageScrollerProvider>
</template>
