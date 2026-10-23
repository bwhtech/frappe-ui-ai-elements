<script setup lang="ts">
import { useConfirmation } from "./context";

const { state } = useConfirmation("ConfirmationActions");
</script>

<template>
	<div v-if="state === 'approval-requested'" data-slot="confirmation-actions" class="ml-auto flex shrink-0 items-center gap-2">
		<slot />
	</div>
</template>
