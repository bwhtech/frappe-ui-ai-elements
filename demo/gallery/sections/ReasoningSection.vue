<script setup lang="ts">
import { Button } from "frappe-ui";
import { ref } from "vue";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "frappe-ui-ai-elements";
import DemoBlock from "../DemoBlock.vue";
import { reasoningText } from "../fixtures";

const streaming = ref(false);
const text = ref(reasoningText);

async function play() {
	streaming.value = true;
	for (let i = 0; i <= reasoningText.length; i += 5) {
		text.value = reasoningText.slice(0, i);
		await new Promise((resolve) => setTimeout(resolve, 30));
	}
	streaming.value = false;
}
</script>

<template>
	<DemoBlock id="reasoning" title="Reasoning" part="reasoning" description="Closed until you open it, also while it streams. Shows how long it thought.">
		<div class="flex flex-col gap-4">
			<Button size="sm" class="w-fit" icon-left="lucide-play" label="Stream it" :disabled="streaming" @click="play" />
			<Reasoning :is-streaming="streaming">
				<ReasoningTrigger />
				<ReasoningContent :content="text" />
			</Reasoning>
			<Reasoning :duration="12">
				<ReasoningTrigger />
				<ReasoningContent :content="reasoningText" />
			</Reasoning>
			<Reasoning>
				<ReasoningTrigger />
				<ReasoningContent :content="reasoningText" />
			</Reasoning>
		</div>
	</DemoBlock>
</template>
