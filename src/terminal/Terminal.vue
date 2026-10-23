<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { CodeBlock, CodeBlockContent, CodeBlockCopyButton } from "../code-block";
import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceIcon, TraceLine, TraceTitle } from "../trace";

/**
 * A command and its output. Opens once output arrives while it runs, and keeps
 * the output scrolled to the end while it streams. A non-zero exit code is an error.
 */
const props = withDefaults(defineProps<{ command: string; output?: string; isStreaming?: boolean; exitCode?: number }>(), {
	output: "",
});
const open = defineModel<boolean | undefined>("open", { default: undefined });

const failed = computed(() => props.exitCode !== undefined && props.exitCode !== 0);
const status = computed(() => (props.isStreaming ? "running" : failed.value ? "error" : undefined));
const title = computed(() => {
	if (props.isStreaming) return `Running ${props.command}`;
	if (failed.value) return `${props.command} exited with code ${props.exitCode}`;
	return `Ran ${props.command}`;
});
const effectiveOpen = computed(() => open.value ?? (!!props.isStreaming && props.output.length > 0));

const content = ref<HTMLElement | null>(null);
watch(
	() => props.output,
	() => {
		if (!props.isStreaming) return;
		nextTick(() => {
			const pre = content.value?.querySelector("pre");
			if (pre) pre.scrollTop = pre.scrollHeight;
		});
	},
);
</script>

<template>
	<Trace data-slot="terminal">
		<TraceCollapsible :open="effectiveOpen" @update:open="open = $event">
			<div class="flex min-w-0 items-center gap-2">
				<TraceCollapsibleTrigger>
					<TraceLine :status="status">
						<TraceIcon :icon="failed ? 'lucide-circle-x' : 'lucide-square-terminal'" />
						<TraceTitle class="font-mono text-[0.95em]">{{ title }}</TraceTitle>
					</TraceLine>
				</TraceCollapsibleTrigger>
				<slot name="actions" />
			</div>
			<TraceCollapsibleContent>
				<div ref="content">
					<CodeBlock size="sm" :variant="failed ? 'destructive' : 'default'">
						<div data-slot="code-block-actions" class="absolute right-1.5 top-1.5 z-10">
							<CodeBlockCopyButton :value="output" />
						</div>
						<CodeBlockContent :code="output || ' '" language="text" wrap class="max-h-64" />
					</CodeBlock>
				</div>
			</TraceCollapsibleContent>
		</TraceCollapsible>
	</Trace>
</template>
