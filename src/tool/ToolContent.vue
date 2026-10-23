<script setup lang="ts">
import { TraceCollapsibleContent } from "../trace";
</script>

<template>
	<TraceCollapsibleContent data-slot="tool-content" class="flex flex-col gap-3">
		<slot />
	</TraceCollapsibleContent>
</template>
