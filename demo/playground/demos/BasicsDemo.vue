<script setup lang="ts">
import { computed } from "vue";
import { Attachment, Bubble, BubbleContent, Marker, MarkerContent, MarkerIcon, type BubbleVariant } from "frappe-ui-ai-elements";
import { useLog } from "../log";
import type { Values } from "../types";
import { worst as w } from "../worst";

/** Bubble, Marker and Attachment: the small building blocks. */
const props = defineProps<{ v: Values; worst: boolean }>();
const log = useLog();
const text = computed(() => (props.worst ? `${w.unbroken} ${w.hindi}` : String(props.v.text)));
</script>

<template>
	<div class="flex flex-col gap-5">
		<Bubble :variant="v.variant as BubbleVariant" :align="v.align as 'start' | 'end'">
			<BubbleContent>{{ text }}</BubbleContent>
		</Bubble>
		<Marker :variant="v.marker as 'default' | 'separator' | 'border'">
			<MarkerIcon v-if="v.marker === 'default'" icon="lucide-info" />
			<MarkerContent>{{ worst ? w.marathi : "Thread started from the Volunteer list" }}</MarkerContent>
		</Marker>
		<Attachment
			:name="worst ? `${w.unbroken}.xlsx` : 'volunteers-2026.xlsx'"
			:size="48213"
			:media-type="String(v.mediaType)"
			:state="v.state as 'idle' | 'uploading' | 'done' | 'error'"
			:removable="Boolean(v.removable)"
			@remove="log('remove')"
		/>
	</div>
</template>
