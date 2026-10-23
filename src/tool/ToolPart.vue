<script setup lang="ts">
import { computed, type Component } from "vue";
import ToolConfirmation from "../confirmation/ToolConfirmation.vue";
import { getToolName, type ToolMessagePart } from "./state";
import Tool from "./Tool.vue";
import ToolContent from "./ToolContent.vue";
import ToolHeader from "./ToolHeader.vue";
import ToolInput from "./ToolInput.vue";
import ToolOutput from "./ToolOutput.vue";

/**
 * AI SDK adapter: renders one `tool-*` or `dynamic-tool` part. A pending
 * approval renders as a Confirmation; every other state is a Tool line.
 */
const props = withDefaults(defineProps<{ part: ToolMessagePart; streaming?: boolean; icon?: string | Component }>(), { streaming: true });
defineEmits<{ approve: [approvalId: string]; deny: [approvalId: string] }>();

const name = computed(() => getToolName(props.part));
const needsAnswer = computed(() => props.part.state === "approval-requested" && !props.part.approval.isAutomatic);
const approved = computed(() => props.part.approval?.approved);
const preliminary = computed(() => props.part.state === "output-available" && !!props.part.preliminary);
</script>

<template>
	<ToolConfirmation
		v-if="needsAnswer && part.state === 'approval-requested'"
		:tool-name="name"
		:input="part.input"
		:reason="part.approval.requestReason"
		@approve="$emit('approve', part.approval.id)"
		@deny="$emit('deny', part.approval.id)"
	/>
	<Tool v-else>
		<ToolHeader
			:state="part.state"
			:tool-name="name"
			:icon="icon"
			:streaming="streaming"
			:approved="approved"
			:preliminary="preliminary"
		/>
		<ToolContent>
			<ToolInput :input="part.input" />
			<ToolOutput :output="part.output" :error-text="part.errorText" />
		</ToolContent>
	</Tool>
</template>
