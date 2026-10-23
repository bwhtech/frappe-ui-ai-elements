<script setup lang="ts">
import type { ChatStatus } from "ai";
import { computed, ref, toRef } from "vue";
import { providePromptInput } from "./context";

/**
 * The message field: a form around a textarea and its toolbar. `v-model` is the
 * text. Submitting emits `submit` with the text and the attached files, then
 * clears both. While the chat is busy, the submit button emits `stop`.
 */
const props = withDefaults(
	defineProps<{ status?: ChatStatus; disabled?: boolean; accept?: string; multiple?: boolean }>(),
	{ status: "ready", multiple: true },
);
const emit = defineEmits<{ submit: [message: { text: string; files: File[] }]; stop: [] }>();

const text = defineModel<string>({ default: "" });
const files = ref<File[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);

const busy = computed(() => props.status === "submitted" || props.status === "streaming");
const canSubmit = computed(() => !props.disabled && !busy.value && (text.value.trim() !== "" || files.value.length > 0));

function submit() {
	if (!canSubmit.value) return;
	emit("submit", { text: text.value.trim(), files: files.value });
	text.value = "";
	files.value = [];
}

function addFiles(event: Event) {
	const input = event.target as HTMLInputElement;
	files.value = [...files.value, ...Array.from(input.files ?? [])];
	input.value = "";
}

providePromptInput({
	text,
	files,
	status: toRef(props, "status"),
	disabled: toRef(props, "disabled"),
	canSubmit,
	submit,
	stop: () => emit("stop"),
	openFileDialog: () => fileInput.value?.click(),
	removeFile: (file) => (files.value = files.value.filter((item) => item !== file)),
});
</script>

<template>
	<form
		data-slot="prompt-input"
		:data-status="status"
		class="flex w-full min-w-0 flex-col rounded-7 border border-outline-gray-2 bg-surface-base shadow-sm transition-[border-color,box-shadow] focus-within:border-outline-gray-3 focus-within:shadow-md"
		@submit.prevent="submit"
	>
		<slot />
		<input ref="fileInput" type="file" class="hidden" :accept="accept" :multiple="multiple" @change="addFiles" />
	</form>
</template>
