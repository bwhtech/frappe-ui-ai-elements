<script setup lang="ts">
import { Trace, TraceCollapsible } from "../trace";
import Source from "./Source.vue";
import SourcesContent from "./SourcesContent.vue";
import SourcesTrigger from "./SourcesTrigger.vue";

/**
 * The links used for a reply, as a collapsible line ("Used 3 sources").
 * Pass `sources` for the default list, or compose SourcesTrigger / SourcesContent / Source.
 */
defineProps<{ sources?: { url: string; title?: string }[]; defaultOpen?: boolean }>();
</script>

<template>
	<Trace data-slot="sources">
		<TraceCollapsible :default-open="defaultOpen">
			<slot>
				<SourcesTrigger :count="sources?.length ?? 0" />
				<SourcesContent>
					<Source v-for="source in sources" :key="source.url" :href="source.url" :title="source.title" />
				</SourcesContent>
			</slot>
		</TraceCollapsible>
	</Trace>
</template>
