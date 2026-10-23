<script setup lang="ts">
import { Avatar } from "frappe-ui";

defineProps<{ name?: string; src?: string }>();
</script>

<template>
	<div data-slot="message-avatar" class="flex shrink-0 self-start pt-0.5">
		<slot><Avatar :label="name" :image="src" size="md" /></slot>
	</div>
</template>
