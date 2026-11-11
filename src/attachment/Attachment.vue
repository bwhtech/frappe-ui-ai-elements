<script setup lang="ts">
import { Button, Skeleton } from "frappe-ui";
import { computed } from "vue";
import { useViewOnClick } from "./viewer";

/** A file chip on one line: a coloured icon or a small image, the name, the size, and an optional remove button. */
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

const viewOnClick = useViewOnClick();

const isImage = computed(() => props.mediaType?.startsWith("image/") && props.url);
const look = computed(() => fileLook(props.mediaType ?? "", props.name));
const isLink = computed(() => Boolean(props.url) && !props.removable);
// The name shows the extension, so only the size and a failed upload are added.
const detail = computed(() => (props.state === "error" ? "Upload failed" : formatSize(props.size)));

/** The icon and its colour for a file type. Unknown types stay gray. */
function fileLook(mediaType: string, name: string) {
	if (mediaType.startsWith("image/")) return { icon: "lucide-image", ink: "text-ink-violet-6" };
	if (mediaType.includes("pdf") || /\.pdf$/i.test(name)) return { icon: "lucide-file-text", ink: "text-ink-red-6" };
	if (/\.(csv|tsv|xlsx?|ods)$/i.test(name) || mediaType.includes("sheet") || mediaType.includes("csv"))
		return { icon: "lucide-file-spreadsheet", ink: "text-ink-green-6" };
	if (/\.(docx?|odt|rtf)$/i.test(name) || mediaType.includes("word")) return { icon: "lucide-file-text", ink: "text-ink-blue-6" };
	if (/\.(json|ya?ml|xml|html?|[jt]sx?|py|sql|sh)$/i.test(name)) return { icon: "lucide-file-code", ink: "text-ink-amber-6" };
	if (/\.(zip|tar|gz|7z|rar)$/i.test(name)) return { icon: "lucide-file-archive", ink: "text-ink-orange-6" };
	return { icon: "lucide-file", ink: "text-ink-gray-6" };
}

function formatSize(bytes?: number) {
	if (bytes === undefined) return "";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
</script>

<template>
	<component
		:is="isLink ? 'a' : 'div'"
		data-slot="attachment"
		:data-state="state"
		:href="isLink ? url : undefined"
		:target="isLink ? '_blank' : undefined"
		:rel="isLink ? 'noreferrer noopener' : undefined"
		:title="name"
		@click="isLink && url && viewOnClick($event, { name, url, mediaType: mediaType ?? '' })"
		:aria-busy="state === 'uploading' || undefined"
		:class="[
			'group/attachment relative flex h-8 w-fit max-w-full items-center gap-2 rounded-4 border border-outline-gray-2 bg-surface-base pl-2.5 data-[state=error]:border-outline-red-3 [&:is(a)]:transition-[background-color,transform] [&:is(a)]:duration-150 [&:is(a)]:ease-out-strong [&:is(a):hover]:bg-surface-gray-1 [&:is(a):active]:scale-[0.98] motion-reduce:[&:is(a):active]:scale-100',
			removable ? 'pr-1' : 'pr-2.5',
		]"
	>
		<Skeleton v-if="state === 'uploading'" class="size-4 shrink-0 rounded-1" />
		<img v-else-if="isImage" :src="url" :alt="name" class="size-5 shrink-0 rounded-1 object-cover" />
		<span v-else :class="[look.icon, look.ink, 'size-4 shrink-0']" aria-hidden="true" />
		<span class="min-w-0 truncate text-sm text-ink-gray-7">{{ name }}</span>
		<span v-if="detail" class="shrink-0 text-xs text-ink-gray-5 group-data-[state=error]/attachment:text-ink-red-6">{{ detail }}</span>
		<Button v-if="removable" variant="ghost" size="xs" class="touch-target" icon="lucide-x" :aria-label="`Remove ${name}`" @click="$emit('remove')" />
	</component>
</template>
