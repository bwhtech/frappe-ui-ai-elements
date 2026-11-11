<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { Button } from "frappe-ui";
import { FileTree, StackTrace, Subagent, Terminal, TestResults, ToolPart, type FileTreeNode, type TestSuite } from "frappe-ui-ai-elements";
import DemoBlock from "../DemoBlock.vue";
import { toolStates } from "../fixtures";

const buildLog = ["$ bench build --app seva", "Building seva...", "  ✔ dist/js/seva.bundle.js  42.1 KB", "  ✔ dist/css/seva.bundle.css  8.3 KB", "Done in 4.2s"];
const output = ref("");
const running = ref(false);
let timer: ReturnType<typeof setInterval> | undefined;

function run() {
	output.value = "";
	running.value = true;
	let line = 0;
	timer = setInterval(() => {
		output.value += (line ? "\n" : "") + buildLog[line++];
		if (line === buildLog.length) {
			clearInterval(timer);
			running.value = false;
		}
	}, 500);
}
onBeforeUnmount(() => clearInterval(timer));

const stack = `TypeError: Cannot read properties of undefined (reading 'fieldname')
    at renderField (/app/seva/public/js/form.ts:42:18)
    at buildForm (/app/seva/public/js/form.ts:17:5)
    at callWithErrorHandling (/app/node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:200:19)
    at flushJobs (/app/node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:408:7)`;

const suites: TestSuite[] = [
	{ name: "test_volunteer.py", tests: [{ name: "creates a volunteer", status: "passed", duration: 120 }, { name: "rejects a bad phone", status: "passed", duration: 80 }] },
	{
		name: "test_signup_form.py",
		tests: [
			{ name: "renders the form", status: "passed", duration: 310 },
			{ name: "submits a sign-up", status: "failed", duration: 1450, error: "AssertionError: Expected status 200, received 417\n  File \"test_signup_form.py\", line 33" },
			{ name: "sends the coordinator email", status: "skipped" },
		],
	},
];

const files: FileTreeNode[] = [
	{
		path: "seva",
		name: "seva",
		children: [
			{ path: "seva/doctype", name: "doctype", children: [
				{ path: "seva/doctype/volunteer.json", name: "volunteer.json", change: "added" },
				{ path: "seva/doctype/volunteer.py", name: "volunteer.py", change: "added" },
			] },
			{ path: "seva/hooks.py", name: "hooks.py", change: "modified" },
			{ path: "seva/old_form.html", name: "old_form.html", change: "deleted" },
		],
	},
];
const expanded = ref(["seva", "seva/doctype"]);
const selected = ref("seva/hooks.py");
</script>

<template>
	<DemoBlock id="dev" title="Terminal" description="Opens once output arrives while the command runs and keeps it scrolled to the end.">
		<div class="flex flex-col gap-3">
			<Button size="sm" class="w-fit" icon-left="lucide-play" label="Run bench build" :disabled="running" @click="run" />
			<Terminal command="bench build --app seva" :output="output" :is-streaming="running" :exit-code="running || !output ? undefined : 0" />
			<Terminal command="bench run-tests --app seva" :output="'FAILED (failures=1)'" :exit-code="1" />
		</div>
	</DemoBlock>
	<DemoBlock id="stack-trace" title="Stack Trace" part="output-error" description="Your frames first and clickable; library frames folded.">
		<StackTrace :trace="stack" default-open />
	</DemoBlock>
	<DemoBlock id="test-results" title="Test Results" description="Suites with failures open by themselves.">
		<TestResults :suites="suites" :duration="1960" />
	</DemoBlock>
	<DemoBlock id="file-tree" title="File Tree" description="Built on frappe-ui's Tree. A = added, M = modified, D = deleted.">
		<FileTree v-model:expanded="expanded" v-model:selected="selected" :nodes="files" />
		<p class="mt-2 text-sm text-ink-gray-5">Selected: <span class="text-ink-gray-8">{{ selected }}</span></p>
	</DemoBlock>
	<DemoBlock id="subagent" title="Subagent" description="A subagent run with its task, model, tools, nested tool calls and result.">
		<div class="flex flex-col gap-3">
			<Subagent
				name="schema review"
				task="Check the Volunteer DocType for missing fields a food bank would need."
				model="claude-haiku"
				:tools="['get_doctype_schema', 'search_doctypes']"
				:duration="14"
				result="Volunteer looks good. Consider adding **Emergency Contact** and **T-shirt Size**."
				default-open
			>
				<ToolPart :part="toolStates[6].part" />
			</Subagent>
			<Subagent name="data import" status="running" task="Add 20 sample volunteers.">
				<ToolPart :part="toolStates[1].part" />
			</Subagent>
		</div>
	</DemoBlock>
</template>
