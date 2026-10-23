<script setup lang="ts">
import { Badge } from "frappe-ui";
import { computed } from "vue";
import Response from "../response/Response.vue";
import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceDescription, TraceIcon, TraceLine, TraceTitle } from "../trace";

/**
 * A subagent run: its task, model and tools, the tool calls it made (default
 * slot, as Tool lines) and its result. Keeps nested state when closed.
 */
const props = withDefaults(
	defineProps<{
		name: string;
		status?: "running" | "done" | "error";
		task?: string;
		model?: string;
		tools?: string[];
		result?: string;
		duration?: number;
		defaultOpen?: boolean;
	}>(),
	{ status: "done" },
);
const open = defineModel<boolean | undefined>("open", { default: undefined });

const title = computed(() => {
	if (props.status === "running") return `Running the ${props.name} agent`;
	if (props.status === "error") return `The ${props.name} agent failed`;
	return `Ran the ${props.name} agent`;
});
const lineStatus = computed(() => (props.status === "done" ? undefined : props.status));
const effectiveOpen = computed(() => open.value ?? (props.defaultOpen || props.status === "running"));
</script>

<template>
	<Trace data-slot="subagent">
		<TraceCollapsible :open="effectiveOpen" @update:open="open = $event">
			<TraceCollapsibleTrigger>
				<TraceLine :status="lineStatus">
					<TraceIcon :icon="status === 'error' ? 'lucide-circle-x' : 'lucide-bot'" />
					<TraceTitle>{{ title }}</TraceTitle>
					<TraceDescription v-if="duration">{{ duration }}s</TraceDescription>
				</TraceLine>
			</TraceCollapsibleTrigger>
			<TraceCollapsibleContent keep-mounted class="flex flex-col gap-3">
				<div v-if="task || model || tools?.length" class="flex flex-col gap-2">
					<p v-if="task" class="text-p-sm text-ink-gray-7">{{ task }}</p>
					<div v-if="model || tools?.length" class="flex flex-wrap gap-1.5">
						<Badge v-if="model" theme="violet" size="sm" class="max-w-full" :title="model"><span class="truncate">{{ model }}</span></Badge>
						<Badge v-for="tool in tools" :key="tool" theme="gray" size="sm" class="max-w-full" :title="tool"><span class="truncate">{{ tool }}</span></Badge>
					</div>
				</div>
				<div v-if="$slots.default" class="flex flex-col gap-1.5"><slot /></div>
				<Response v-if="result" :content="result" size="sm" />
			</TraceCollapsibleContent>
		</TraceCollapsible>
	</Trace>
</template>
