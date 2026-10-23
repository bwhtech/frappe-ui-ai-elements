<script setup lang="ts">
import { computed } from "vue";
import { provideMessageRole, type MessageRole } from "./context";

/** One turn. The person's turn (`from="user"`) aligns to the end. */
const props = withDefaults(defineProps<{ from?: MessageRole; align?: "start" | "end" }>(), { from: "assistant" });

provideMessageRole(() => props.from);
const alignment = computed(() => props.align ?? (props.from === "user" ? "end" : "start"));
</script>

<template>
	<div
		data-slot="message"
		:data-align="alignment"
		:data-role="from"
		class="group/message relative flex w-full min-w-0 gap-2 text-p-base data-[align=end]:flex-row-reverse"
	>
		<slot />
	</div>
</template>
