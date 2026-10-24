<script setup lang="ts">
import { Button, Spinner } from "frappe-ui";
import { computed } from "vue";

/** A file chip: an icon or image preview, the name and size, and an optional remove button. */
const props = withDefaults(
	defineProps<{
		name: string;
		size?: number;
		mediaType?: string;
		url?: string;
		state?: "idle" | "uploading" | "done" | "error";
		removable?: boolean;
	}>(),
	{ state: "idle" },
);
defineEmits<{ remove: [] }>();

const isImage = computed(() => props.mediaType?.startsWith("image/") && props.url);
const icon = computed(() => fileIcon(props.mediaType ?? "", props.name));
const description = computed(() => (props.state === "error" ? "Upload failed" : formatSize(props.size)));

function fileIcon(mediaType: string, name: string) {
	if (mediaType.startsWith("image/")) return "lucide-image";
	if (mediaType.includes("pdf")) return "lucide-file-text";
	if (/\.(csv|xlsx?)$/i.test(name) || mediaType.includes("sheet")) return "lucide-file-spreadsheet";
	return "lucide-file";
}

function formatSize(bytes?: number) {
	if (bytes === undefined) return "";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
</script>

<template>
	<div
		data-slot="attachment"
		:data-state="state"
		class="group/attachment relative flex w-fit min-w-40 max-w-64 items-center gap-2 rounded-6 border border-outline-gray-2 bg-surface-base p-1.5 pr-2 data-[state=error]:border-outline-red-3"
	>
		<div class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-4 bg-surface-gray-2 text-ink-gray-6">
			<Spinner v-if="state === 'uploading'" class="size-4" />
			<img v-else-if="isImage" :src="url" :alt="name" class="size-full object-cover" />
			<span v-else :class="[icon, 'size-4']" aria-hidden="true" />
		</div>
		<div class="min-w-0 flex-1 leading-tight">
			<a
				v-if="url && !removable"
				:href="url"
				target="_blank"
				rel="noreferrer noopener"
				class="block truncate text-sm-medium text-ink-gray-8 hover:underline"
			>{{ name }}</a>
			<p v-else class="truncate text-sm-medium text-ink-gray-8">{{ name }}</p>
			<p v-if="description" class="mt-0.5 truncate text-xs text-ink-gray-5 group-data-[state=error]/attachment:text-ink-red-6">
				{{ description }}
			</p>
		</div>
		<Button v-if="removable" variant="ghost" size="xs" icon="lucide-x" :aria-label="`Remove ${name}`" @click="$emit('remove')" />
	</div>
</template>
