<script setup lang="ts">
import { useConfirmation } from "./context";

const { state } = useConfirmation("ConfirmationRequest");
</script>

<template>
	<slot v-if="state === 'approval-requested'" />
</template>
