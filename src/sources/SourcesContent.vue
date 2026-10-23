<script setup lang="ts">
import { Trace, TraceCollapsibleContent } from "../trace";
</script>

<template>
	<TraceCollapsibleContent>
		<Trace><slot /></Trace>
	</TraceCollapsibleContent>
</template>
