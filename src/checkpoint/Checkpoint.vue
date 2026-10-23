<script setup lang="ts">
import { Marker, MarkerContent } from "../marker";

/** A point in the thread you can return to: a separator line with a label and a restore button. */
</script>

<template>
	<Marker variant="separator" data-slot="checkpoint">
		<MarkerContent class="inline-flex flex-wrap items-center justify-center gap-2"><slot /></MarkerContent>
	</Marker>
</template>
