<script setup lang="ts">
import type { ChatStatus } from "ai";
import { computed, ref, toRef } from "vue";
import { providePromptInput } from "./context";

/**
 * The message field: a form around a textarea and its toolbar. `v-model` is the
 * text. Submitting emits `submit` with the text and the attached files, then
 * clears both. While the chat is busy, the submit button emits `stop`. Files can
 * also be dropped on it or pasted into it; `accept` filters all three ways.
 */
const props = withDefaults(
	defineProps<{ status?: ChatStatus; disabled?: boolean; accept?: string; multiple?: boolean }>(),
	{ status: "ready", multiple: true },
);
const emit = defineEmits<{ submit: [message: { text: string; files: File[] }]; stop: [] }>();

const text = defineModel<string>({ default: "" });
const files = ref<File[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const dragging = ref(false);

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
	attach(Array.from(input.files ?? []));
	input.value = "";
}

function attach(added: File[]) {
	if (props.disabled) return;
	const accepted = added.filter((file) => matchesAccept(file, props.accept));
	files.value = props.multiple ? [...files.value, ...accepted] : accepted.slice(0, 1);
}

function onDrop(event: DragEvent) {
	dragging.value = false;
	attach(Array.from(event.dataTransfer?.files ?? []));
}

/** Pasted files are attached; pasted text goes into the textarea as usual. */
function onPaste(event: ClipboardEvent) {
	const pasted = Array.from(event.clipboardData?.files ?? []);
	if (!pasted.length) return;
	event.preventDefault();
	attach(pasted);
}

/** The same matching as the file dialog's `accept`: extensions, `type/*` and exact media types. */
function matchesAccept(file: File, accept?: string) {
	if (!accept) return true;
	const name = file.name.toLowerCase();
	const type = file.type.toLowerCase();
	return accept.split(",").some((rule) => {
		const pattern = rule.trim().toLowerCase();
		if (pattern.startsWith(".")) return name.endsWith(pattern);
		if (pattern.endsWith("/*")) return type.startsWith(pattern.slice(0, -1));
		return type === pattern;
	});
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
		:data-dragging="dragging || undefined"
		class="flex w-full min-w-0 flex-col rounded-7 border border-outline-gray-2 bg-surface-base shadow-sm transition-[border-color,box-shadow] focus-within:border-outline-gray-3 focus-within:shadow-md data-[dragging]:border-outline-gray-4 data-[dragging]:bg-surface-gray-1"
		@submit.prevent="submit"
		@dragover.prevent="dragging = !disabled"
		@dragleave.self="dragging = false"
		@drop.prevent="onDrop"
		@paste="onPaste"
	>
		<slot />
		<input ref="fileInput" type="file" class="hidden" :accept="accept" :multiple="multiple" @change="addFiles" />
	</form>
</template>
