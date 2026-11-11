<script setup lang="ts">
import { computed } from "vue";
import { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle } from "frappe-ui-ai-elements";
import { useLog } from "../log";
import type { Values } from "../types";
import { hugeJson, worst as w } from "../worst";

const props = defineProps<{ v: Values; worst: boolean }>();
const log = useLog();
const samples: Record<string, [string, string]> = {
	python: [
		"volunteer.py",
		'import frappe\n\ndef free_volunteers(day: str) -> list[dict]:\n    """Volunteers free on a day."""\n    return frappe.get_all("Volunteer", filters={"available_days": ["like", f"%{day}%"]})\n',
	],
	json: ["volunteer.json", JSON.stringify({ doctype: "Volunteer", fields: [{ fieldname: "full_name", reqd: 1 }] }, null, 2)],
	typescript: ["form.ts", 'import { useList } from "frappe-ui";\n\nconst volunteers = useList({ doctype: "Volunteer", fields: ["full_name", "phone"] });\n'],
	bash: ["terminal", "bench --site food-bank.localhost migrate\nbench build --app seva"],
	sql: ["query.sql", "select full_name, phone from `tabVolunteer` where area = 'Jayanagar' order by full_name;"],
	text: ["notes.txt", "Plain text is escaped, never highlighted."],
};
const sample = computed(() => samples[String(props.v.language)] ?? samples.text);
const code = computed(() => {
	if (props.worst) return `${w.unbroken}\n${w.hindi}\n${w.emoji}\n${JSON.stringify(hugeJson(6), null, 2)}`;
	if (!props.v.long) return sample.value[1];
	return Array.from({ length: 12 }, (_, i) => `${sample.value[1].trimEnd()} # ${i} ${"x".repeat(i * 12)}`).join("\n");
});
</script>

<template>
	<CodeBlock :size="v.size as 'default' | 'sm'" :variant="v.variant as 'default' | 'destructive'">
		<CodeBlockHeader v-if="v.header">
			<CodeBlockTitle icon="lucide-file-code">{{ worst ? w.name : sample[0] }}</CodeBlockTitle>
			<CodeBlockActions><CodeBlockCopyButton :value="code" @copy="log('copy', `${$event.length} chars`)" /></CodeBlockActions>
		</CodeBlockHeader>
		<CodeBlockActions v-else><CodeBlockCopyButton :value="code" @copy="log('copy', `${$event.length} chars`)" /></CodeBlockActions>
		<CodeBlockContent :code="code" :language="String(v.language)" :wrap="Boolean(v.wrap)" :line-numbers="Boolean(v.lineNumbers)" class="max-h-80" />
	</CodeBlock>
</template>
