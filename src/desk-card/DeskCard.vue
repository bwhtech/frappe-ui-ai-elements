<script setup lang="ts">
import { Button, Icon } from "frappe-ui";
import { computed, type Component } from "vue";
import type { DeskCardKind, PrintSample } from "./show-in-desk";

/**
 * A card that opens something on the person's Frappe site: a DocType, its list, one
 * record, a blank form or a public page. `url` opens in a new tab; without it (while
 * the server checks the target) the card shows as loading. `#actions` replaces the
 * button. A print card with a `sample` shows the record's first printed page above,
 * as a sheet of paper, and opens the PDF.
 */
const props = withDefaults(
	defineProps<{
		title: string;
		summary?: string;
		kind?: DeskCardKind;
		doctype?: string;
		name?: string;
		count?: number;
		url?: string;
		/** A second button: "Edit in Studio" for a Studio page, "Edit layout" for a print format. */
		editUrl?: string;
		/** For a print format: the record printed as a PDF. */
		sample?: PrintSample;
		icon?: string | Component;
		label?: string;
	}>(),
	{ kind: "list" },
);

const KIND: Record<DeskCardKind, { icon: string; label: string; action: string; edit?: string }> = {
	list: { icon: "lucide-list", label: "List", action: "Open list" },
	form: { icon: "lucide-file-text", label: "Record", action: "Open record" },
	doctype: { icon: "lucide-table-properties", label: "DocType", action: "Open DocType" },
	new: { icon: "lucide-file-plus", label: "New record", action: "Add a record" },
	page: { icon: "lucide-globe", label: "Web page", action: "Open page" },
	studio: { icon: "lucide-layout-dashboard", label: "Studio page", action: "Open page", edit: "Edit in Studio" },
	print: { icon: "lucide-printer", label: "Print", action: "Open print view", edit: "Edit layout" },
};

const meta = computed(() => {
	const parts = [props.doctype, props.kind === "form" || props.kind === "print" ? props.name : KIND[props.kind].label];
	if (props.count !== undefined) parts.push(`${props.count} ${props.count === 1 ? "record" : "records"}`);
	if (props.sample?.pages) parts.push(`${props.sample.pages} ${props.sample.pages === 1 ? "page" : "pages"}`);
	return parts.filter(Boolean).join(" · ");
});
</script>

<template>
	<article
		data-slot="desk-card"
		:data-kind="kind"
		:data-loading="!url || undefined"
		:aria-busy="!url"
		class="min-w-0 overflow-hidden rounded-6 border border-outline-gray-2 bg-surface-base"
	>
		<a
			v-if="sample?.imageUrl"
			data-slot="desk-card-sample"
			:href="sample.pdfUrl"
			target="_blank"
			rel="noopener"
			:aria-label="`Open the PDF of ${title}`"
			class="group relative block h-60 overflow-hidden border-b border-outline-gray-1 bg-surface-gray-2 px-6 pt-5 sm:px-10"
		>
			<img
				:src="sample.imageUrl"
				alt=""
				class="mx-auto w-full max-w-md rounded-[2px] bg-white shadow-md ring-1 ring-black/5 transition-transform duration-200 ease-out-strong [@media(hover:hover)_and_(pointer:fine)]:group-hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
			/>
			<!-- A tall page fades out at the bottom of the frame. -->
			<div class="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[var(--surface-gray-2)] to-transparent" />
		</a>
		<div data-slot="desk-card-body" class="flex min-w-0 items-start gap-x-3 gap-y-2.5 p-3">
			<div class="flex size-9 shrink-0 items-center justify-center rounded-5 bg-surface-gray-2 text-ink-gray-6">
				<Icon :icon="icon ?? KIND[kind].icon" class="size-4.5" />
			</div>
			<div class="min-w-0 flex-1">
				<h3 class="text-base-medium text-ink-gray-9 [overflow-wrap:anywhere]">{{ title }}</h3>
				<p v-if="meta" class="mt-0.5 truncate text-xs text-ink-gray-5">{{ meta }}</p>
				<p v-if="summary" class="mt-1.5 text-p-sm text-ink-gray-7 [overflow-wrap:anywhere]">{{ summary }}</p>
			</div>
			<div data-slot="desk-card-actions" class="flex shrink-0 items-center gap-1.5 self-center">
				<slot name="actions">
					<Button v-if="sample" variant="ghost" label="PDF" icon-left="lucide-file-down" :href="sample.pdfUrl" />
					<Button v-if="url && editUrl" variant="ghost" :label="KIND[kind].edit ?? 'Edit'" :href="editUrl" />
					<Button
						v-if="url"
						variant="subtle"
						:label="label ?? KIND[kind].action"
						icon-right="lucide-external-link"
						:href="url"
					/>
					<Button v-else variant="subtle" :label="label ?? KIND[kind].action" loading disabled />
				</slot>
			</div>
		</div>
	</article>
</template>
