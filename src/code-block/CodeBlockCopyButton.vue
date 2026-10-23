<script setup lang="ts">
import { Button } from "frappe-ui";
import { useCopy } from "../utils/useCopy";

const props = defineProps<{ value: string }>();
const emit = defineEmits<{ copy: [value: string] }>();
const { copied, copy } = useCopy();

async function onClick() {
	if (await copy(props.value)) emit("copy", props.value);
}
</script>

<template>
	<span class="contents">
	<Button
		data-slot="code-block-copy-button"
		variant="ghost"
		size="xs"
		:icon="copied ? 'lucide-check' : 'lucide-copy'"
		:aria-label="copied ? 'Copied' : 'Copy'"
		:data-copied="copied || undefined"
		class="[[data-slot=code-block]>[data-slot=code-block-actions]_&]:bg-surface-base [[data-slot=code-block]>[data-slot=code-block-actions]_&]:shadow-sm"
		@click="onClick"
	/>
	<span aria-live="polite" class="sr-only">{{ copied ? "Copied" : "" }}</span>
	</span>
</template>
