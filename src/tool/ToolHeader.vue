<script setup lang="ts">
import { Badge } from "frappe-ui";
import { computed, type Component } from "vue";
import { TraceCollapsibleTrigger, TraceIcon, TraceLine, TraceTitle } from "../trace";
import { getStatusBadge, getToolIcon, getToolStatus, getToolTitle, humanizeToolName, type ToolState } from "./state";

const props = withDefaults(
	defineProps<{
		state: ToolState;
		/** Tool name, e.g. `get_doctype_schema`. Ignored when `title` is set. */
		toolName?: string;
		title?: string;
		/** Defaults to an icon guessed from `toolName`. */
		icon?: string | Component;
		streaming?: boolean;
		approved?: boolean;
		preliminary?: boolean;
		showBadge?: boolean;
	}>(),
	{ streaming: true, showBadge: true },
);

const context = computed(() => ({ streaming: props.streaming, approved: props.approved, preliminary: props.preliminary }));
const status = computed(() => getToolStatus(props.state, context.value));
const label = computed(() => props.title ?? getToolTitle(props.state, humanizeToolName(props.toolName ?? "tool"), context.value));
const badge = computed(() => getStatusBadge(props.state, context.value));
const iconName = computed(() => (status.value === "error" ? "lucide-circle-x" : (props.icon ?? getToolIcon(props.toolName ?? ""))));
</script>

<template>
	<TraceCollapsibleTrigger data-slot="tool-header">
		<TraceLine :status="status">
			<TraceIcon :icon="iconName" />
			<TraceTitle :title="label">{{ label }}</TraceTitle>
			<Badge v-if="showBadge" size="sm" :theme="badge.theme" :label="badge.label" class="shrink-0" />
		</TraceLine>
	</TraceCollapsibleTrigger>
</template>
