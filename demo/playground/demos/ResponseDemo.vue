<script setup lang="ts">
import { Button } from "frappe-ui";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { Response } from "frappe-ui-ai-elements";
import { useLog } from "../log";
import type { Values } from "../types";
import { hugeJson, worst as w } from "../worst";
import { markdownSamples } from "./samples";

const props = defineProps<{ v: Values; worst: boolean }>();
const log = useLog();
const source = computed(() =>
	props.worst
		? `${w.hindi}\n\n**${w.name}** ${w.emoji}\n\n\`${w.unbroken}\`\n\n| ${w.toolName} | ${w.unbroken} |\n| --- | --- |\n| ${w.marathi} | ${w.emoji} |\n\n\`\`\`json\n${JSON.stringify(hugeJson(3), null, 2)}\n\`\`\``
		: markdownSamples[String(props.v.sample)],
);
const shown = ref(source.value);
const streaming = ref(false);
let timer: ReturnType<typeof setInterval> | undefined;

watch(source, (value) => !streaming.value && (shown.value = value));

function stream() {
	clearInterval(timer);
	streaming.value = true;
	shown.value = "";
	log("stream:start", { chars: source.value.length, speed: props.v.speed });
	let i = 0;
	timer = setInterval(() => {
		i += Number(props.v.speed);
		shown.value = source.value.slice(0, i);
		if (i >= source.value.length) {
			clearInterval(timer);
			streaming.value = false;
			log("stream:end");
		}
	}, 30);
}
onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
	<div class="flex flex-col gap-4">
		<div class="flex items-center gap-2">
			<Button size="sm" icon-left="lucide-play" :label="streaming ? 'Streaming…' : 'Stream it'" :disabled="streaming" @click="stream" />
			<span class="text-xs text-ink-gray-5">{{ shown.length }} / {{ source.length }} chars</span>
		</div>
		<Response :content="shown" :parse-incomplete="Boolean(v.parseIncomplete)" :size="(v.size as 'sm' | 'base')" />
	</div>
</template>
