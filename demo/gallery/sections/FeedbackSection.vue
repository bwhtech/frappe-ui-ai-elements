<script setup lang="ts">
import { ref } from "vue";
import { Loader, Marker, MarkerContent, MarkerIcon, Shimmer, Suggestion, Suggestions } from "@bwhtech/frappe-ui-ai-elements";
import DemoBlock from "../DemoBlock.vue";
import { suggestions } from "../fixtures";

const picked = ref("");
</script>

<template>
	<DemoBlock id="feedback" title="Shimmer, Loader & Marker" description="Live status lines. The shimmer derives its highlight from the text colour.">
		<div class="flex flex-col gap-4">
			<Loader />
			<Loader text="Reading your DocTypes…" />
			<Shimmer as="p" class="text-lg-semibold text-ink-gray-8">Building your volunteer tracker</Shimmer>
			<Shimmer as="p" class="text-p-sm text-ink-blue-5" :duration="1">A faster blue shimmer</Shimmer>
			<Marker><MarkerIcon icon="lucide-info" /><MarkerContent>The agent works only through your site's MCP tools.</MarkerContent></Marker>
			<Marker variant="separator"><MarkerContent>Yesterday</MarkerContent></Marker>
			<Marker variant="border"><MarkerContent>Thread started from the Volunteer list</MarkerContent></Marker>
		</div>
	</DemoBlock>
	<DemoBlock id="suggestion" title="Suggestion" description="A row that scrolls sideways (with an edge fade) and a wrapped variant.">
		<div class="flex flex-col gap-4">
			<Suggestions>
				<Suggestion v-for="s in suggestions" :key="s" :suggestion="s" @select="picked = $event" />
			</Suggestions>
			<Suggestions wrap>
				<Suggestion v-for="s in suggestions" :key="s" :suggestion="s" icon="lucide-sparkles" @select="picked = $event" />
			</Suggestions>
			<p class="text-sm text-ink-gray-5">Picked: <span class="text-ink-gray-8">{{ picked || "—" }}</span></p>
		</div>
	</DemoBlock>
</template>
