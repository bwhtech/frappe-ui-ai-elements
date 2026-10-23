<script setup lang="ts">
import { Spinner } from "frappe-ui";
import Marker from "../marker/Marker.vue";
import MarkerContent from "../marker/MarkerContent.vue";
import MarkerIcon from "../marker/MarkerIcon.vue";
import Shimmer from "./Shimmer.vue";

/** A live "working on it" line: spinner plus shimmering text. */
withDefaults(defineProps<{ text?: string }>(), { text: "Thinking…" });
</script>

<template>
	<Marker role="status" aria-live="polite">
		<MarkerIcon><Spinner class="size-3.5" /></MarkerIcon>
		<MarkerContent><Shimmer>{{ text }}</Shimmer></MarkerContent>
	</Marker>
</template>
