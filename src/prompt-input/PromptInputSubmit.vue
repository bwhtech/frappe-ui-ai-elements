<script setup lang="ts">
import { Button, Spinner, Tooltip } from "frappe-ui";
import { computed, markRaw } from "vue";
import { usePromptInput } from "./context";

/** Send while ready; Stop while the reply is on its way. */
const { status, canSubmit, stop } = usePromptInput("PromptInputSubmit");

const busy = computed(() => status.value === "submitted" || status.value === "streaming");
const label = computed(() => (busy.value ? "Stop" : "Send"));
const icon = computed(() => {
	if (status.value === "streaming") return "lucide-square";
	if (status.value === "submitted") return markRaw(Spinner);
	return "lucide-arrow-up";
});

function onClick(event: MouseEvent) {
	if (!busy.value) return;
	event.preventDefault();
	stop();
}
</script>

<template>
	<Tooltip :text="label">
		<Button
			data-slot="prompt-input-submit"
			:type="busy ? 'button' : 'submit'"
			variant="solid"
			size="md"
			:icon="icon"
			:disabled="!busy && !canSubmit"
			:aria-label="label"
			class="rounded-full [&_.lucide-square]:size-3 [&_.lucide-square]:bg-current"
			@click="onClick"
		/>
	</Tooltip>
</template>
