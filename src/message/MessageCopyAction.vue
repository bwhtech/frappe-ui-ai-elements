<script setup lang="ts">
import { useCopy } from "../utils/useCopy";
import MessageAction from "./MessageAction.vue";

/** Copy writes the reply to the clipboard and swaps to a check for two seconds. */
const props = defineProps<{ value: string }>();
const { copied, copy } = useCopy();
</script>

<template>
	<MessageAction :label="copied ? 'Copied' : 'Copy'" :icon="copied ? 'lucide-check' : 'lucide-copy'" @click="copy(props.value)" />
</template>
