<script setup lang="ts">
import { Icon } from "frappe-ui";
import { computed, type Component } from "vue";
import type { ToolState } from "../tool/state";
import { provideConfirmation, type ConfirmationApproval } from "./context";

/**
 * Asks the person to approve or deny a tool before it runs. Renders nothing
 * until the tool has an approval. ConfirmationRequest / Accepted / Rejected
 * show the part that matches the current answer.
 */
const props = defineProps<{ approval?: ConfirmationApproval; state: ToolState; icon?: string | Component }>();

provideConfirmation(
	() => props.approval,
	() => props.state,
);
const visible = computed(() => !!props.approval && props.state !== "input-streaming" && props.state !== "input-available");
const pending = computed(() => props.state === "approval-requested");
const iconName = computed(() => {
	if (props.icon) return props.icon;
	if (pending.value) return "lucide-shield-question";
	return props.approval?.approved ? "lucide-circle-check" : "lucide-circle-x";
});
</script>

<template>
	<div
		v-if="visible"
		data-slot="confirmation"
		:data-state="state"
		role="group"
		class="flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-2.5 rounded-6 border border-outline-gray-2 bg-surface-base px-3 py-2.5 data-[state=approval-requested]:border-outline-amber-3 data-[state=approval-requested]:shadow-sm"
	>
		<div
			class="flex size-8 shrink-0 items-center justify-center rounded-full"
			:class="
				pending ? 'bg-surface-amber-2 text-ink-amber-6' : approval?.approved ? 'bg-surface-green-2 text-ink-green-6' : 'bg-surface-gray-2 text-ink-gray-5'
			"
		>
			<Icon :icon="iconName" class="size-4" />
		</div>
		<slot />
	</div>
</template>
