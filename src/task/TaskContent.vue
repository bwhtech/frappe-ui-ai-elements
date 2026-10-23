<script setup lang="ts">
import { Trace, TraceCollapsibleContent } from "../trace";
</script>

<template>
	<TraceCollapsibleContent keep-mounted>
		<Trace><slot /></Trace>
	</TraceCollapsibleContent>
</template>
