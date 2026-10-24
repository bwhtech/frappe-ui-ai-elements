<script setup lang="ts">
import { ref } from "vue";
import { CodeBlock, CodeBlockContent } from "../code-block";
import { formatToolInput, humanizeToolName, summarizeToolInput } from "../tool/state";
import Confirmation from "./Confirmation.vue";
import ConfirmationAction from "./ConfirmationAction.vue";
import ConfirmationActions from "./ConfirmationActions.vue";
import ConfirmationTitle from "./ConfirmationTitle.vue";

/** A ready-made Confirmation for a tool call waiting on `approval-requested`. */
const props = defineProps<{ toolName: string; input?: unknown; reason?: string }>();
defineEmits<{ approve: []; deny: [] }>();

const showDetails = ref(false);
const details = formatToolInput(props.input);
const summary = summarizeToolInput(props.input);
</script>

<template>
	<div class="flex min-w-0 flex-col gap-1.5">
		<Confirmation :approval="{ id: 'pending' }" state="approval-requested">
			<ConfirmationTitle :title="`Allow the agent to ${humanizeToolName(toolName)}?`">
				<template #description>
					<span v-if="summary" data-slot="confirmation-summary" class="block truncate text-ink-gray-7">{{ summary }}</span>
					{{ reason || "Nothing runs until you approve." }}
					<button
						v-if="details"
						type="button"
						class="ml-1 text-ink-gray-7 underline underline-offset-2 hover:text-ink-gray-9"
						:aria-expanded="showDetails"
						@click="showDetails = !showDetails"
					>
						{{ showDetails ? "Hide details" : "Show details" }}
					</button>
				</template>
			</ConfirmationTitle>
			<ConfirmationActions>
				<ConfirmationAction label="Deny" @click="$emit('deny')" />
				<ConfirmationAction label="Approve" variant="solid" @click="$emit('approve')" />
			</ConfirmationActions>
		</Confirmation>
		<CodeBlock v-if="showDetails" size="sm">
			<CodeBlockContent :code="details" language="json" wrap class="max-h-64" />
		</CodeBlock>
	</div>
</template>
