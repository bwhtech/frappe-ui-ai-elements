<script setup lang="ts">
import PromptInputButton from "./PromptInputButton.vue";
import { usePromptInput } from "./context";

const { openFileDialog, disabled } = usePromptInput("PromptInputAttachButton");
</script>

<template>
	<PromptInputButton label="Attach files" icon="lucide-paperclip" :disabled="disabled" @click="openFileDialog" />
</template>
