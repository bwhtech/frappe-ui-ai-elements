<script setup lang="ts">
import { Badge } from "frappe-ui";

/** Web results for a step, one badge per hostname. */
defineProps<{ urls?: string[] }>();

function hostname(url: string) {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
}
</script>

<template>
	<div data-slot="chain-of-thought-search-results" class="flex flex-wrap gap-1.5">
		<slot>
			<Badge v-for="url in urls" :key="url" theme="gray" variant="subtle" :label="hostname(url)" />
		</slot>
	</div>
</template>
