<script setup lang="ts">
import { Button, HoverCard, Progress } from "frappe-ui";
import { computed } from "vue";

export interface ContextUsage {
	inputTokens?: number;
	outputTokens?: number;
	reasoningTokens?: number;
	cachedInputTokens?: number;
}

/**
 * How much of the context window the thread has used. `maxTokens` is the
 * model's window; the AI SDK does not send it, so set it from the model.
 */
const props = defineProps<{ usedTokens: number; maxTokens: number; usage?: ContextUsage; modelId?: string }>();

const percent = computed(() => Math.min(100, Math.round((props.usedTokens / props.maxTokens) * 100)));
const rows = computed(() =>
	[
		["Input", props.usage?.inputTokens],
		["Cached input", props.usage?.cachedInputTokens],
		["Output", props.usage?.outputTokens],
		["Reasoning", props.usage?.reasoningTokens],
	].filter((row): row is [string, number] => typeof row[1] === "number"),
);
// The ring is a circle whose dash covers `percent` of its length.
const dash = computed(() => `${(percent.value / 100) * 37.7} 37.7`);
const compact = (n: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
</script>

<template>
	<HoverCard :hover-delay="10" :leave-delay="100" side="top" align="end">
		<template #trigger>
			<Button variant="ghost" size="sm" :aria-label="`${percent}% of context used`">
				<template #prefix>
					<svg viewBox="0 0 16 16" class="size-4 -rotate-90" aria-hidden="true">
						<circle cx="8" cy="8" r="6" fill="none" stroke-width="2" stroke="var(--outline-gray-2)" />
						<circle cx="8" cy="8" r="6" fill="none" stroke-width="2" stroke-linecap="round" :stroke-dasharray="dash" stroke="var(--ink-gray-6)" />
					</svg>
				</template>
				<span class="tabular-nums">{{ percent }}%</span>
			</Button>
		</template>
		<div class="flex w-64 flex-col gap-3 p-3">
			<div class="flex items-center justify-between gap-3 text-sm">
				<span class="text-sm-medium text-ink-gray-8">Context</span>
				<span class="tabular-nums text-ink-gray-5">{{ compact(usedTokens) }} / {{ compact(maxTokens) }}</span>
			</div>
			<Progress :value="percent" size="sm" aria-label="Context used" />
			<dl v-if="rows.length" class="space-y-1.5 text-sm">
				<div v-for="[label, value] in rows" :key="label" class="flex justify-between gap-3">
					<dt class="text-ink-gray-5">{{ label }}</dt>
					<dd class="tabular-nums text-ink-gray-8">{{ compact(value) }}</dd>
				</div>
			</dl>
			<p v-if="modelId" class="border-t border-outline-gray-1 pt-2 text-xs text-ink-gray-5">{{ modelId }}</p>
			<slot />
		</div>
	</HoverCard>
</template>
