<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
	Confirmation,
	ConfirmationAccepted,
	ConfirmationAction,
	ConfirmationActions,
	ConfirmationRejected,
	ConfirmationRequest,
	ConfirmationTitle,
	ToolConfirmation,
	type ToolState,
} from "@bwhtech/frappe-ui-ai-elements";
import { useLog } from "../log";
import type { Values } from "../types";
import { hugeJson, worst as w } from "../worst";

const props = defineProps<{ v: Values; worst: boolean }>();
const log = useLog();
const answer = ref<boolean | null>(null);
watch(() => props.v.variant, () => (answer.value = null));

const state = computed<ToolState>(() => (answer.value === null ? "approval-requested" : answer.value ? "output-available" : "output-denied"));
const title = computed(() => (props.worst ? `${w.hindi} ${w.unbroken}?` : String(props.v.title)));
const details = computed(() => (props.worst ? w.marathi : String(props.v.details)));

function respond(approved: boolean) {
	answer.value = approved;
	log(approved ? "approve" : "deny", "approval-1");
}
</script>

<template>
	<div class="flex flex-col gap-3">
		<template v-if="v.variant === 'tool'">
			<ToolConfirmation
				v-if="answer === null"
				:tool-name="worst ? w.toolName : 'create_document'"
				:input="worst ? hugeJson(10) : { doctype: 'Volunteer', fields: 4 }"
				:reason="details || undefined"
				@approve="respond(true)"
				@deny="respond(false)"
			/>
			<Confirmation v-else :state="state" :approval="{ id: 'approval-1', approved: answer }">
				<ConfirmationTitle :title="answer ? 'You approved this change.' : 'You denied this change.'" />
			</Confirmation>
		</template>
		<Confirmation v-else :state="state" :approval="{ id: 'approval-1', approved: answer ?? undefined }">
			<ConfirmationTitle :description="answer === null ? details : undefined">
				<ConfirmationRequest>{{ title }}</ConfirmationRequest>
				<ConfirmationAccepted>You approved: {{ title }}</ConfirmationAccepted>
				<ConfirmationRejected>You denied: {{ title }}</ConfirmationRejected>
			</ConfirmationTitle>
			<ConfirmationActions>
				<ConfirmationAction label="Deny" @click="respond(false)" />
				<ConfirmationAction label="Approve" variant="solid" @click="respond(true)" />
			</ConfirmationActions>
		</Confirmation>
		<button v-if="answer !== null" type="button" class="w-fit text-sm text-ink-gray-5 underline underline-offset-2 hover:text-ink-gray-8" @click="answer = null">
			Ask again
		</button>
	</div>
</template>
