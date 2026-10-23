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

watch(text, () => nextTick(resize));
onMounted(() => {
	resize();
	if (props.autofocus) textarea()?.focus();
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
			:disabled="disabled"
			aria-label="Message"
			class="!min-h-12 w-full resize-none !border-0 !bg-transparent !px-3.5 !pt-3 !text-p-base max-sm:!text-[16px] !shadow-none !ring-0 focus-visible:!outline-none"
			@keydown="onKeydown"
		/>
	</div>
</template>
