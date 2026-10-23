<script setup lang="ts">
import Reasoning from "./Reasoning.vue";
import ReasoningContent from "./ReasoningContent.vue";
import ReasoningTrigger from "./ReasoningTrigger.vue";

/** AI SDK adapter for one `reasoning` part. */
defineProps<{ text: string; streaming?: boolean; duration?: number }>();
</script>

<template>
	<Reasoning :is-streaming="streaming" :duration="duration">
		<ReasoningTrigger />
		<ReasoningContent v-if="text" :content="text" />
	</Reasoning>
</template>
