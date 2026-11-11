<script setup lang="ts">
import type { UIMessage } from "ai";
import { ref } from "vue";
import { Message, MessageContent, MessageParts, provideBuildPlan, ToolPlan, type BuildPlan, type BuildPlanStatus } from "frappe-ui-ai-elements";
import DemoBlock from "../DemoBlock.vue";
import { foodDrivePlan } from "../fixtures";

/** The fixture plan, approved, with these statuses in item order. */
function planWith(statuses: BuildPlanStatus[], notes: Record<string, string> = {}): BuildPlan {
	return {
		...foodDrivePlan,
		toolCallId: "call-plan",
		decision: "approved",
		items: foodDrivePlan.items.map((item, index) => ({ ...item, status: statuses[index] ?? "pending", note: notes[item.id] })),
	};
}

const building = planWith(["done", "done", "in_progress"]);
const built = planWith(["done", "done", "done", "done", "skipped", "done"], { "pledges-dashboard": "Studio is not installed on this site." });

// With the thread's plan provided, MessageParts puts each item's steps under one line.
provideBuildPlan(ref(building));
let callId = 0;
const update = (updates: { id: string; status: string }[]) => ({ type: "tool-update_plan", toolCallId: `u${++callId}`, state: "output-available", input: { updates }, output: "" });
const write = (toolName: string, name: string) => ({ type: "dynamic-tool", toolName, toolCallId: `w${++callId}`, state: "output-available", input: { doctype: "DocType", name }, output: { name } });
const buildMessage = {
	id: "build",
	role: "assistant",
	parts: [
		update([{ id: "donor-table", status: "in_progress" }]),
		write("get_doctype_schema", "Donor"),
		write("create_document", "Donor"),
		write("update_document", "Donor"),
		update([{ id: "donor-table", status: "done" }, { id: "donation-table", status: "in_progress" }]),
		write("create_document", "Donation"),
		write("update_document", "Donation"),
		update([{ id: "donation-table", status: "done" }, { id: "coordinator-role", status: "in_progress" }]),
		write("create_document", "Drive Coordinator"),
	],
} as unknown as UIMessage;
</script>

<template>
	<DemoBlock
		id="build-plan"
		title="Build Plan"
		description="The agent's propose_plan call: everything it will build, grouped by kind. The person approves the whole plan once, or asks for changes. While it builds, update_plan ticks items off on the card, and the chat puts the steps for each item under one line."
	>
		<div class="flex flex-col gap-4">
			<p class="text-p-sm text-ink-gray-5">Waiting for approval</p>
			<ToolPlan :input="foodDrivePlan" />
			<p class="text-p-sm text-ink-gray-5">Building: 2 of 6 done, the third in progress</p>
			<ToolPlan :input="foodDrivePlan" :output="{ approved: true }" :plan="building" streaming />
			<p class="text-p-sm text-ink-gray-5">The build in the chat: each item's steps under one line, open while it is in progress</p>
			<Message from="assistant">
				<MessageContent>
					<MessageParts :message="buildMessage" streaming />
				</MessageContent>
			</Message>
			<p class="text-p-sm text-ink-gray-5">Built, with one item skipped</p>
			<ToolPlan :input="foodDrivePlan" :output="{ approved: true }" :plan="built" />
			<p class="text-p-sm text-ink-gray-5">Changes asked</p>
			<ToolPlan :input="foodDrivePlan" :output="{ approved: false, feedback: 'Leave out the dashboard for now, and add a Volunteer table.' }" />
		</div>
	</DemoBlock>
</template>
