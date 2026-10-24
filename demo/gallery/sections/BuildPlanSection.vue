<script setup lang="ts">
import type { ToolUIPart } from "ai";
import { ref } from "vue";
import { provideBuildPlan, ToolPart, ToolPlan, type BuildPlan, type BuildPlanStatus } from "@bwhtech/frappe-ui-ai-elements";
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

// update_plan lines name items by their titles from the thread's plan.
provideBuildPlan(ref(building));
const updates = {
	type: "tool-update_plan",
	toolCallId: "call-update",
	state: "output-available",
	input: { updates: [{ id: "donation-table", status: "done" }, { id: "coordinator-role", status: "in_progress" }] },
	output: "",
} as unknown as ToolUIPart;
</script>

<template>
	<DemoBlock
		id="build-plan"
		title="Build Plan"
		description="The agent's propose_plan call: everything it will build, grouped by kind. The person approves the whole plan once, or asks for changes. While it builds, update_plan ticks items off on the card and as short lines in the chat."
	>
		<div class="flex flex-col gap-4">
			<p class="text-p-sm text-ink-gray-5">Waiting for approval</p>
			<ToolPlan :input="foodDrivePlan" />
			<p class="text-p-sm text-ink-gray-5">Building: 2 of 6 done, the third in progress</p>
			<ToolPlan :input="foodDrivePlan" :output="{ approved: true }" :plan="building" streaming />
			<p class="text-p-sm text-ink-gray-5">update_plan lines in the chat</p>
			<ToolPart :part="updates" :streaming="false" />
			<p class="text-p-sm text-ink-gray-5">Built, with one item skipped</p>
			<ToolPlan :input="foodDrivePlan" :output="{ approved: true }" :plan="built" />
			<p class="text-p-sm text-ink-gray-5">Changes asked</p>
			<ToolPlan :input="foodDrivePlan" :output="{ approved: false, feedback: 'Leave out the dashboard for now, and add a Volunteer table.' }" />
		</div>
	</DemoBlock>
</template>
