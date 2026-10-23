<script setup lang="ts">
import Attachment from "../attachment/Attachment.vue";
import { usePromptInput } from "./context";

/** Sits above the textarea. Shows attached files by default. */
const { files, removeFile } = usePromptInput("PromptInputHeader");
</script>

<template>
	<div v-if="$slots.default || files.length" data-slot="prompt-input-header" class="flex flex-wrap gap-2 px-2.5 pt-2.5">
		<slot>
			<Attachment
				v-for="file in files"
				:key="file.name + file.size"
				:name="file.name"
				:size="file.size"
				:media-type="file.type"
				removable
				@remove="removeFile(file)"
			/>
		</slot>
	</div>
</template>
