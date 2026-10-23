<script setup lang="ts">
import { computed } from "vue";
import { useConfirmation } from "./context";

const { approval, state } = useConfirmation("ConfirmationRejected");
const show = computed(() => approval.value?.approved === false && state.value !== "approval-requested");
</script>

<template>
	<slot v-if="show" />
</template>
