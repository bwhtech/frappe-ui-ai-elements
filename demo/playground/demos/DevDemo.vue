<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { FileTree, StackTrace, Subagent, Terminal, TestResults, ToolPart, type FileTreeNode, type TestSuite } from "frappe-ui-ai-elements";
import { useLog } from "../log";
import type { Values } from "../types";
import { worst as w } from "../worst";

/** Terminal, Stack Trace, Test Results, File Tree and Subagent; `kind` picks which. */
const props = defineProps<{ v: Values; worst: boolean; kind: "terminal" | "stack" | "tests" | "files" | "subagent" }>();
const log = useLog();

// Terminal: streams a fake build log while `streaming` is on.
const lines = ["$ bench build --app seva", "Building seva...", "  ✔ dist/js/seva.bundle.js  42.1 KB", "  ✔ dist/css/seva.bundle.css  8.3 KB", "Done in 4.2s"];
const output = ref("");
let timer: ReturnType<typeof setInterval> | undefined;
watch(
	() => [props.v.streaming, props.v.long, props.worst],
	() => {
		clearInterval(timer);
		const all = props.worst ? [w.command, w.unbroken, w.hindi, ...lines] : props.v.long ? Array.from({ length: 80 }, (_, i) => `${lines[i % lines.length]} (${i})`) : lines;
		if (!props.v.streaming) return void (output.value = all.join("\n"));
		output.value = "";
		let i = 0;
		timer = setInterval(() => {
			output.value += (i ? "\n" : "") + all[i % all.length];
			i++;
		}, 400);
	},
	{ immediate: true },
);
onBeforeUnmount(() => clearInterval(timer));
const exitCode = computed(() => (props.v.exitCode === "none" ? undefined : Number(props.v.exitCode)));

const stacks = {
	js: `TypeError: Cannot read properties of undefined (reading 'fieldname')
    at renderField (/app/seva/public/js/form.ts:42:18)
    at buildForm (/app/seva/public/js/form.ts:17:5)
    at callWithErrorHandling (/app/node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:200:19)`,
	python: `Traceback (most recent call last):
  File "/home/frappe/frappe-bench/apps/frappe/frappe/app.py", line 114, in application
  File "/home/frappe/frappe-bench/apps/seva/seva/api.py", line 33, in create_volunteer
  File "/home/frappe/frappe-bench/apps/seva/seva/doctype/volunteer/volunteer.py", line 12, in validate
frappe.exceptions.ValidationError: Phone number is not valid`,
};
const stack = computed(() => (props.worst ? `Error: ${w.unbroken} ${w.hindi}\n    at ${w.toolName} (/app/${w.unbroken}.ts:1:1)` : stacks[props.v.language as "js" | "python"]));

const suites = computed<TestSuite[]>(() => {
	const failures = Number(props.v.failures);
	return [
		{ name: props.worst ? `${w.unbroken}.py` : "test_volunteer.py", tests: [{ name: "creates a volunteer", status: "passed", duration: 120 }, { name: props.worst ? w.hindi : "rejects a bad phone", status: failures > 1 ? "failed" : "passed", duration: 80, error: failures > 1 ? "AssertionError: ValidationError not raised" : undefined }] },
		{ name: "test_signup_form.py", tests: [{ name: "renders the form", status: "passed", duration: 310 }, { name: "submits a sign-up", status: failures > 0 ? "failed" : "passed", duration: 1450, error: failures > 0 ? (props.worst ? w.unbroken : "AssertionError: Expected status 200, received 417") : undefined }, { name: "sends the coordinator email", status: props.v.streaming ? "running" : "skipped" }] },
	];
});

const files = computed<FileTreeNode[]>(() => {
	const change = (c: FileTreeNode["change"]) => (props.v.changes ? c : undefined);
	return [{ path: "seva", name: "seva", children: [
		{ path: "seva/doctype", name: "doctype", children: [
			{ path: "seva/doctype/volunteer.json", name: props.worst ? `${w.unbroken}.json` : "volunteer.json", change: change("added") },
			{ path: "seva/doctype/volunteer.py", name: "volunteer.py", change: change("added") },
		] },
		{ path: "seva/hooks.py", name: "hooks.py", change: change("modified") },
		{ path: "seva/old_form.html", name: props.worst ? w.hindi : "old_form.html", change: change("deleted") },
	] }];
});
const expanded = ref<(string | number)[]>(["seva", "seva/doctype"]);
const selected = ref("seva/hooks.py");
watch(() => props.v.expandAll, (all) => (expanded.value = all ? ["seva", "seva/doctype"] : []));

const tools = computed(() =>
	Array.from({ length: Number(props.v.tools) }, (_, i) => (props.worst && i === 0 ? w.toolName : ["get_doctype_schema", "search_doctypes", "list_documents"][i % 3])),
);
const toolCall = { type: "dynamic-tool", toolName: "get_doctype_schema", toolCallId: "c1", state: "output-available", input: { doctype: "Volunteer" }, output: '{"fields":4}' } as const;
</script>

<template>
	<Terminal v-if="kind === 'terminal'" :command="worst ? w.command : String(v.command)" :output="output" :is-streaming="Boolean(v.streaming)" :exit-code="v.streaming ? undefined : exitCode" @update:open="log('update:open', $event)" />
	<StackTrace v-else-if="kind === 'stack'" :key="String(v.defaultOpen)" :trace="stack" :default-open="Boolean(v.defaultOpen)" @select="(path, line) => log('select', { path, line })" />
	<TestResults v-else-if="kind === 'tests'" :key="String(v.failures)" :suites="suites" :is-streaming="Boolean(v.streaming)" :duration="1960" />
	<FileTree v-else-if="kind === 'files'" v-model:expanded="expanded" v-model:selected="selected" :nodes="files" @select="log('select', $event)" />
	<Subagent
		v-else
		:key="String(v.status)"
		:name="worst ? w.name : 'schema review'"
		:status="(v.status as 'running' | 'done' | 'error')"
		:task="worst ? w.marathi : 'Check the Volunteer DocType for fields a food bank needs.'"
		:model="v.model ? 'claude-haiku' : undefined"
		:tools="tools"
		:result="v.result && v.status === 'done' ? (worst ? w.hindi : 'Looks good. Consider **Emergency Contact** and **T-shirt Size**.') : undefined"
		:duration="v.status === 'done' ? 14 : undefined"
		default-open
		@update:open="log('update:open', $event)"
	>
		<ToolPart :part="toolCall" :streaming="v.status === 'running'" />
	</Subagent>
</template>
