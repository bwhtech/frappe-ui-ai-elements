<script setup lang="ts">
import type { ChatStatus } from "ai";
import { computed, onBeforeUnmount, onMounted, ref, toRef } from "vue";
import { providePromptInput } from "./context";

/**
 * The message field: a form around a textarea and its toolbar. `v-model` is the
 * text. Submitting emits `submit` with the text and the attached files, then
 * clears both. While the chat is busy, the submit button emits `stop`; with `queue`,
 * Enter still submits, so the page can queue the message. Files can
 * also be dropped on it or pasted into it; `accept` filters all three ways.
 * `ready` says the page holds something else worth sending with no text, such as a chosen skill.
 */
const props = withDefaults(defineProps<{ status?: ChatStatus; disabled?: boolean; accept?: string; multiple?: boolean; queue?: boolean; ready?: boolean }>(), {
	status: "ready",
	multiple: true,
});
const emit = defineEmits<{ submit: [message: { text: string; files: File[] }]; stop: [] }>();

const text = defineModel<string>({ default: "" });
const files = ref<File[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const dragging = ref(false);

const busy = computed(() => props.status === "submitted" || props.status === "streaming");
const canSubmit = computed(() => !props.disabled && (props.queue || !busy.value) && (text.value.trim() !== "" || files.value.length > 0 || props.ready));

function submit() {
	if (!canSubmit.value) return;
	emit("submit", { text: text.value.trim(), files: files.value });
	text.value = "";
	files.value = [];
}

/** Sends what the field holds, as the send button does; used by Cmd+Enter in a quote's comment. */
defineExpose({ submit });

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

/**
 * Only a drag that carries files lights the field up; dragging selected text does not.
 * Enter and leave pair up as the pointer crosses children, so a depth count reaches 0
 * only when the drag leaves the field (or Esc ends it). A drop anywhere also resets it.
 */
let dragDepth = 0;

function hasFiles(event: DragEvent) {
	return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}

function onDragEnter(event: DragEvent) {
	if (!hasFiles(event)) return;
	dragDepth++;
	dragging.value = !props.disabled;
}

function onDragOver(event: DragEvent) {
	if (hasFiles(event)) event.preventDefault();
}

function onDragLeave(event: DragEvent) {
	if (!hasFiles(event)) return;
	dragDepth = Math.max(0, dragDepth - 1);
	if (dragDepth === 0) dragging.value = false;
}

function endDrag() {
	dragDepth = 0;
	dragging.value = false;
}

function onDrop(event: DragEvent) {
	endDrag();
	if (!hasFiles(event)) return;
	event.preventDefault();
	attach(Array.from(event.dataTransfer?.files ?? []));
}

onMounted(() => {
	window.addEventListener("drop", endDrag);
	window.addEventListener("dragend", endDrag);
});
onBeforeUnmount(() => {
	window.removeEventListener("drop", endDrag);
	window.removeEventListener("dragend", endDrag);
});

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
		class="flex w-full min-w-0 flex-col rounded-7 border border-outline-gray-2 bg-surface-base shadow-sm transition-[border-color,box-shadow] duration-150 ease-out-strong focus-within:border-outline-gray-3 dark:bg-surface-gray-1 data-[dragging]:border-outline-gray-4 data-[dragging]:bg-surface-gray-1"
		@submit.prevent="submit"
		@dragenter="onDragEnter"
		@dragover="onDragOver"
		@dragleave="onDragLeave"
		@drop="onDrop"
		@paste="onPaste"
	>
		<slot />
		<input ref="fileInput" type="file" class="hidden" :accept="accept" :multiple="multiple" @change="addFiles" />
	</form>
</template>
