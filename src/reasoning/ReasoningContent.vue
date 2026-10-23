<script setup lang="ts">
import Response from "../response/Response.vue";
import { TraceCollapsibleContent } from "../trace";

/** The thinking text, as markdown. */
defineProps<{ content: string }>();
</script>

<template>
	<TraceCollapsibleContent data-slot="reasoning-content">
		<Response :content="content" size="sm" class="text-ink-gray-6 [--tw-prose-body:var(--ink-gray-6)]" />
	</TraceCollapsibleContent>
</template>
