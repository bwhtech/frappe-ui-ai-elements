<script setup lang="ts">
import { computed } from "vue";
import { useCopy } from "../utils/useCopy";
import { Trace, TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger, TraceIcon, TraceLine, TraceTitle } from "../trace";
import { parseStack, type StackFrame } from "./parse";

/**
 * A failed call and its frames. Your own frames come first and link to the file;
 * library frames fold into a line of their own.
 */
const props = defineProps<{ trace: string; defaultOpen?: boolean }>();
const emit = defineEmits<{ select: [path: string, line?: number, column?: number] }>();

const parsed = computed(() => parseStack(props.trace));
const ownFrames = computed(() => parsed.value.frames.filter((frame) => !frame.external));
const externalFrames = computed(() => parsed.value.frames.filter((frame) => frame.external));
const { copied, copy } = useCopy();

function openFrame(frame: StackFrame) {
	if (frame.file) emit("select", frame.file, frame.line, frame.column);
}
</script>

<template>
	<Trace data-slot="stack-trace">
		<TraceCollapsible :default-open="defaultOpen">
			<div class="flex min-w-0 items-center gap-2">
				<TraceCollapsibleTrigger>
					<TraceLine status="error">
						<TraceIcon icon="lucide-circle-x" />
						<TraceTitle>Failed: {{ parsed.error }}</TraceTitle>
					</TraceLine>
				</TraceCollapsibleTrigger>
			</div>
			<TraceCollapsibleContent>
				<div class="relative flex flex-col gap-2 rounded-4 border border-outline-gray-1 bg-surface-gray-1 p-3 font-mono text-xs">
					<button
						type="button"
						class="absolute right-2 top-2 text-ink-gray-5 hover:text-ink-gray-8"
						:aria-label="copied ? 'Copied' : 'Copy stack trace'"
						@click="copy(trace)"
					>
						<span :class="[copied ? 'lucide-check' : 'lucide-copy', 'block size-3.5']" aria-hidden="true" />
					</button>
					<p class="pr-6 text-ink-red-6">{{ parsed.error }}</p>
					<ol class="flex flex-col gap-0.5">
						<li v-for="(frame, index) in ownFrames" :key="index" class="break-all text-ink-gray-8">
							<button v-if="frame.file" type="button" class="text-left hover:underline" @click="openFrame(frame)">{{ frame.raw }}</button>
							<span v-else>{{ frame.raw }}</span>
						</li>
					</ol>
					<TraceCollapsible v-if="externalFrames.length">
						<TraceCollapsibleTrigger>
							<TraceLine><TraceTitle class="font-sans">{{ externalFrames.length }} library frames</TraceTitle></TraceLine>
						</TraceCollapsibleTrigger>
						<TraceCollapsibleContent>
							<ol class="flex flex-col gap-0.5 font-mono text-xs text-ink-gray-5">
								<li v-for="(frame, index) in externalFrames" :key="index" class="break-all">{{ frame.raw }}</li>
							</ol>
						</TraceCollapsibleContent>
					</TraceCollapsible>
				</div>
			</TraceCollapsibleContent>
		</TraceCollapsible>
	</Trace>
</template>
