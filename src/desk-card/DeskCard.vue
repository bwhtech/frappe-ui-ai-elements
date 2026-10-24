<script setup lang="ts">
import { Button, Icon } from "frappe-ui";
import { computed, type Component } from "vue";
import type { DeskCardKind } from "./show-in-desk";

/**
 * A card that opens something on the person's Frappe site: a DocType, its list, one
 * record, a blank form or a public page. `url` opens in a new tab; without it (while
 * the server checks the target) the card shows as loading. `#actions` replaces the
 * button.
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
		icon?: string | Component;
		label?: string;
	}>(),
	{ kind: "list" },
);

const KIND = {
	list: { icon: "lucide-list", label: "List", action: "Open list" },
	form: { icon: "lucide-file-text", label: "Record", action: "Open record" },
	doctype: { icon: "lucide-table-properties", label: "DocType", action: "Open DocType" },
	new: { icon: "lucide-file-plus", label: "New record", action: "Add a record" },
	page: { icon: "lucide-globe", label: "Web page", action: "Open page" },
} satisfies Record<DeskCardKind, { icon: string; label: string; action: string }>;

const meta = computed(() => {
	const parts = [props.doctype, props.kind === "form" ? props.name : KIND[props.kind].label];
	if (props.count !== undefined) parts.push(`${props.count} ${props.count === 1 ? "record" : "records"}`);
	return parts.filter(Boolean).join(" · ");
});
</script>

<template>
	<article
		data-slot="desk-card"
		:data-kind="kind"
		:data-loading="!url || undefined"
		:aria-busy="!url"
		class="min-w-0 rounded-6 border border-outline-gray-2 bg-surface-base p-3"
	>
		<div data-slot="desk-card-body" class="flex min-w-0 items-start gap-x-3 gap-y-2.5">
			<div class="flex size-9 shrink-0 items-center justify-center rounded-5 bg-surface-gray-2 text-ink-gray-6">
				<Icon :icon="icon ?? KIND[kind].icon" class="size-4.5" />
			</div>
			<div class="min-w-0 flex-1">
				<h3 class="text-base-medium text-ink-gray-9 [overflow-wrap:anywhere]">{{ title }}</h3>
				<p v-if="meta" class="mt-0.5 truncate text-xs text-ink-gray-5">{{ meta }}</p>
				<p v-if="summary" class="mt-1.5 text-p-sm text-ink-gray-7 [overflow-wrap:anywhere]">{{ summary }}</p>
			</div>
			<div data-slot="desk-card-actions" class="shrink-0 self-center">
				<slot name="actions">
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
