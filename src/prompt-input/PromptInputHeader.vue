<script setup lang="ts">
import { onBeforeUnmount, watch } from "vue";
import Attachment from "../attachment/Attachment.vue";
import { usePromptInput } from "./context";

/** Sits above the textarea. Shows attached files by default, with a preview of images. */
const { files, removeFile } = usePromptInput("PromptInputHeader");

const previews = new Map<File, string>();

function previewOf(file: File) {
	if (!file.type.startsWith("image/")) return undefined;
	if (!previews.has(file)) previews.set(file, URL.createObjectURL(file));
	return previews.get(file);
}

function remove(file: File) {
	const url = previews.get(file);
	if (url) URL.revokeObjectURL(url);
	previews.delete(file);
	removeFile(file);
}

// Files can leave without remove(): a submit clears them all, a single-file field replaces one.
watch(files, (current) => {
	for (const [file, url] of previews) {
		if (current.includes(file)) continue;
		URL.revokeObjectURL(url);
		previews.delete(file);
	}
});

onBeforeUnmount(() => previews.forEach((url) => URL.revokeObjectURL(url)));
</script>

<template>
	<div v-if="$slots.default || files.length" data-slot="prompt-input-header" class="flex flex-wrap gap-2 px-2.5 pt-2.5 [@media(pointer:coarse)]:gap-y-3">
		<slot>
			<Attachment
				v-for="file in files"
				:key="file.name + file.size + file.lastModified"
				:name="file.name"
				:size="file.size"
				:media-type="file.type"
				:url="previewOf(file)"
				removable
				@remove="remove(file)"
			/>
		</slot>
	</div>
</template>
