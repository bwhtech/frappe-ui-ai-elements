<script setup lang="ts">
import { Button } from "frappe-ui";
import type { Mounted } from "pele";
import { onBeforeUnmount, ref, watch } from "vue";
import { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton, CodeBlockFooter, CodeBlockHeader, CodeBlockTitle } from "../code-block";

/**
 * A ```mermaid fence, drawn as a diagram by Pele. While the fence still streams
 * (`complete` false) it shows the code; the diagram is drawn once the source is whole.
 * A diagram that does not parse falls back to its code, with the reason under it.
 */
const props = defineProps<{ code: string; complete: boolean }>();

// The model writes the source, so it is untrusted: no links, and no images that would
// make the reader's browser fetch arbitrary URLs. Keep the direction the model wrote;
// the reply column is narrower than Pele's flip-to-vertical breakpoint (as in Frappe Wiki).
const OPTIONS = { links: false, images: false, autoDirection: false } as const;

const host = ref<HTMLElement | null>(null);
const showCode = ref(false);
const error = ref("");
let diagram: Mounted | null = null;
let drawn: HTMLElement | null = null;

/** Draws, or shows the code with the reason, such as a renderer that could not load. Never an empty box. */
async function draw() {
	try {
		await drawDiagram();
	} catch (reason) {
		error.value = errorMessage(reason) || "The diagram could not be drawn.";
	}
}

async function drawDiagram() {
	if (!props.complete || showCode.value || !host.value) return;
	const element = host.value;
	const options = { ...OPTIONS, onRender: () => inkSliceLabels(element) };
	// Loaded on first use, with each diagram type fetched as it is needed.
	const { detectType, load, mountAsync } = await import("pele/lazy").catch(() => {
		// Most often a tab opened before a deploy, asking for a file the new release renamed.
		throw new Error("The diagram drawer could not load. Reload the page to try again.");
	});
	if (element !== host.value) return;
	const source = props.code.trim();
	if (diagram && drawn === element) {
		// update() draws only registered types; an edit may switch to a new one.
		await load(detectType(source)).catch(() => false);
		if (element !== host.value) return;
		diagram.update(source, options);
	} else {
		diagram?.destroy();
		drawn = element;
		diagram = await mountAsync(element, source, options);
	}
	error.value = diagram.result ? "" : errorMessage(diagram.error);
}

function errorMessage(reason: unknown) {
	return reason instanceof Error ? reason.message : reason ? String(reason) : "";
}

/**
 * Pele prints every pie label in one colour, but the frappe-ui chart ramp alternates a
 * dark and a pale member of each hue. Ink each label as frappe-ui charts do: white on the
 * dark (odd) slots, --chart-inside-label on the pale (even) ones. From Frappe Wiki.
 */
function inkSliceLabels(element: HTMLElement | null) {
	if (!element) return;
	const slices = Array.from(element.querySelectorAll<SVGGeometryElement>(".pele-slice"));
	for (const label of Array.from(element.querySelectorAll<SVGTextElement>(".pele-slice-labels[fill] text"))) {
		const point = new DOMPoint(Number(label.getAttribute("x")), Number(label.getAttribute("y")));
		const slice = slices.find((path) => path.isPointInFill(point));
		const series = Number(slice?.getAttribute("fill")?.match(/--pele-series-(\d+)/)?.[1]);
		if (series) label.style.fill = series % 2 ? "#fff" : "var(--chart-inside-label)";
	}
}

watch([() => props.code, () => props.complete, host], draw, { flush: "post" });
onBeforeUnmount(() => diagram?.destroy());
</script>

<template>
	<CodeBlock data-slot="mermaid-block" size="sm">
		<CodeBlockHeader>
			<CodeBlockTitle icon="lucide-network">mermaid</CodeBlockTitle>
			<CodeBlockActions>
				<Button
					v-if="complete && !error"
					variant="ghost"
					size="xs"
					:icon="showCode ? 'lucide-network' : 'lucide-code'"
					:aria-label="showCode ? 'Show diagram' : 'Show code'"
					:aria-pressed="showCode"
					@click="showCode = !showCode"
				/>
				<CodeBlockCopyButton :value="code" />
			</CodeBlockActions>
		</CodeBlockHeader>
		<CodeBlockContent v-if="!complete || showCode || error" :code="code" class="max-h-96" />
		<div v-if="complete && !showCode" v-show="!error" class="scrollbar-thin overflow-x-auto px-2.5 pb-2.5 pt-1.5">
			<div ref="host" data-slot="mermaid-diagram" />
		</div>
		<CodeBlockFooter v-if="error" class="text-ink-red-6">Could not draw this diagram: {{ error }}</CodeBlockFooter>
	</CodeBlock>
</template>
