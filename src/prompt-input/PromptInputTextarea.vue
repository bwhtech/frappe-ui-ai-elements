<script setup lang="ts">
import { Textarea } from "frappe-ui";
import { nextTick, onMounted, ref, watch } from "vue";
import { usePromptInput } from "./context";

/** Grows with its text up to `maxRows`. Enter sends, Shift+Enter adds a new line. */
const props = withDefaults(defineProps<{ placeholder?: string; maxRows?: number; autofocus?: boolean }>(), {
	placeholder: "Ask anything…",
	maxRows: 10,
});

const { text, disabled, submit } = usePromptInput("PromptInputTextarea");
const wrapper = ref<HTMLElement | null>(null);

// An app can disable the field when a message goes out, such as while its files upload.
// Disabling a focused field blurs it, and the blur fires `change` with the text that is
// still in the field. frappe-ui's Textarea then puts that text back in the v-model, so the
// sent message comes back. The field turns disabled one render later, after the cleared
// text is in the DOM.
const fieldDisabled = ref(disabled.value);
watch(disabled, (value) => (fieldDisabled.value = value), { flush: "post" });

function textarea() {
	return wrapper.value?.querySelector("textarea") ?? null;
}

function resize() {
	const el = textarea();
	if (!el) return;
	const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20;
	el.style.height = "auto";
	el.style.height = `${Math.min(el.scrollHeight, lineHeight * props.maxRows + 16)}px`;
}

function onKeydown(event: KeyboardEvent) {
	// isComposing: the Enter that confirms an IME candidate must not send.
	if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
	event.preventDefault();
	submit();
}

// On a touch screen, focus opens the on-screen keyboard, which hides half the chat. There
// the person taps the field when they want to type.
const touch = matchMedia("(pointer: coarse)").matches;

watch(text, () => nextTick(resize));
onMounted(() => {
	resize();
	if (props.autofocus && !touch) textarea()?.focus();
});
defineExpose({ focus: () => textarea()?.focus() });
</script>

<template>
	<div ref="wrapper" data-slot="prompt-input-textarea" class="flex min-w-0">
		<Textarea
			v-model="text"
			variant="ghost"
			size="md"
			:rows="1"
			:placeholder="placeholder"
			:disabled="fieldDisabled"
			aria-label="Message"
			enterkeyhint="send"
			class="!min-h-12 w-full resize-none !border-0 !bg-transparent !px-3.5 !pt-3 !text-p-md !tracking-normal !shadow-none !ring-0 focus-visible:!outline-none"
			@keydown="onKeydown"
		/>
	</div>
</template>
