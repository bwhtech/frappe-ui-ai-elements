<script setup lang="ts">
import { computed } from "vue";
import { TraceIcon, TraceLine, TraceTitle } from "../trace";

/** One source link. `title` falls back to the hostname. */
const props = defineProps<{ href: string; title?: string }>();
const label = computed(() => props.title || hostname(props.href));

function hostname(url: string) {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
}
</script>

<template>
	<a :href="href" target="_blank" rel="noreferrer" data-slot="source">
		<TraceLine>
			<TraceIcon icon="lucide-globe" />
			<TraceTitle>
				<slot>{{ label }}</slot>
				<span class="sr-only"> (opens in a new tab)</span>
			</TraceTitle>
			<TraceIcon icon="lucide-arrow-up-right" />
		</TraceLine>
	</a>
</template>
