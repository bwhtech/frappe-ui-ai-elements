<script setup lang="ts">
import { Button, Spinner, Tooltip } from "frappe-ui";
import { computed, markRaw } from "vue";
import { usePromptInput } from "./context";

/**
 * Send while ready; Stop while the reply is on its way. With PromptInput's `queue`,
 * a busy field with text in it shows Queue instead, so a click queues like Enter does.
 */
const { status, canSubmit, stop } = usePromptInput("PromptInputSubmit");

const busy = computed(() => status.value === "submitted" || status.value === "streaming");
// canSubmit is only true while busy when PromptInput queues.
const queueing = computed(() => busy.value && canSubmit.value);
const stopping = computed(() => busy.value && !queueing.value);
const label = computed(() => (queueing.value ? "Queue" : busy.value ? "Stop" : "Send"));
const icon = computed(() => {
	if (queueing.value) return "lucide-arrow-up";
	if (status.value === "streaming") return "lucide-square";
	if (status.value === "submitted") return markRaw(Spinner);
	return "lucide-arrow-up";
});

function onClick(event: MouseEvent) {
	if (!stopping.value) return;
	event.preventDefault();
	stop();
}
</script>

<template>
	<Tooltip :text="label">
		<Button
			data-slot="prompt-input-submit"
			:type="stopping ? 'button' : 'submit'"
			variant="solid"
			size="md"
			:icon="icon"
			:disabled="!stopping && !canSubmit"
			:aria-label="label"
			class="rounded-full [&_.lucide-square]:size-3 [&_.lucide-square]:bg-current"
			@click="onClick"
		/>
	</Tooltip>
</template>
