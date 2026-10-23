<script setup lang="ts">
import { computed } from "vue";
import { useConfirmation } from "./context";

const { approval, state } = useConfirmation("ConfirmationAccepted");
const show = computed(() => approval.value?.approved === true && state.value !== "approval-requested");
</script>

<template>
	<slot v-if="show" />
</template>
