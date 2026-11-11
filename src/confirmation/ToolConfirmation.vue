<script setup lang="ts">
import { toast } from "frappe-ui";
import { computed, ref } from "vue";
import { CodeBlock, CodeBlockContent } from "../code-block";
import { formatToolInput, humanizeToolName, summarizeToolInput } from "../tool/state";
import Confirmation from "./Confirmation.vue";
import ConfirmationAction from "./ConfirmationAction.vue";
import ConfirmationActions from "./ConfirmationActions.vue";
import ConfirmationTitle from "./ConfirmationTitle.vue";

/**
 * A ready-made Confirmation for a tool call waiting on `approval-requested`. With
 * `alwaysAllow` (tool/labels.ts) it also offers "Always allow", which runs it and then approves.
 * `approvalId` names the call; "Always allow" approves only if the card still shows that call.
 */
const props = defineProps<{
	toolName: string;
	input?: unknown;
	reason?: string;
	question?: string;
	approvalId?: string;
	alwaysAllow?: () => Promise<void>;
}>();
const emit = defineEmits<{ approve: []; deny: [] }>();
const saving = ref(false);

async function always() {
	if (saving.value) return;
	const approvalId = props.approvalId;
	saving.value = true;
	try {
		await props.alwaysAllow?.();
	} catch {
		toast.error("The rule could not be saved. Try again, or allow this call once.");
		return;
	} finally {
		saving.value = false;
	}
	if (props.approvalId === approvalId) emit("approve");
}

const showDetails = ref(false);
const details = computed(() => formatToolInput(props.input));
const summary = computed(() => summarizeToolInput(props.input));
</script>

<template>
	<div class="flex min-w-0 flex-col gap-1.5">
		<Confirmation :approval="{ id: 'pending' }" state="approval-requested">
			<ConfirmationTitle :title="question ?? `Allow the agent to ${humanizeToolName(toolName)}?`">
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
				<ConfirmationAction label="Deny" :disabled="saving" @click="emit('deny')" />
				<ConfirmationAction v-if="alwaysAllow" label="Always allow" :loading="saving" @click="always" />
				<ConfirmationAction :label="alwaysAllow ? 'Allow once' : 'Approve'" variant="solid" :disabled="saving" @click="emit('approve')" />
			</ConfirmationActions>
		</Confirmation>
		<CodeBlock v-if="showDetails" size="sm">
			<CodeBlockContent :code="details" language="json" wrap class="max-h-64" />
		</CodeBlock>
	</div>
</template>
