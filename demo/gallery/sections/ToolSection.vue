<script setup lang="ts">
import { ref } from "vue";
import {
	Confirmation,
	ConfirmationAccepted,
	ConfirmationAction,
	ConfirmationActions,
	ConfirmationRejected,
	ConfirmationRequest,
	ConfirmationTitle,
	Tool,
	ToolContent,
	ToolGroup,
	ToolHeader,
	ToolInput,
	ToolOutput,
	ToolPart,
	summarizeSteps,
} from "@bwhtech/frappe-ui-ai-elements";
import DemoBlock from "../DemoBlock.vue";
import { longJsonOutput, toolStates } from "../fixtures";

const answer = ref("");
// Done, failed and running steps, folded the way MessageParts folds them.
const folded = ["output-available", "output-error", "input-available"].map((label) => toolStates.find((item) => item.label === label)!.part);
</script>

<template>
	<DemoBlock
		id="tool"
		title="Tool"
		part="dynamic-tool · tool-*"
		description="Every tool part state through ToolPart, the AI SDK adapter. Open a line to see its parameters and result. A pending approval is a Confirmation instead of a line."
	>
		<div class="flex flex-col gap-3">
			<div v-for="item in toolStates" :key="item.label" class="grid gap-1.5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:items-start">
				<code class="pt-0.5 font-mono text-xs text-ink-gray-5">{{ item.label }}</code>
				<ToolPart :part="item.part" :streaming="item.streaming ?? true" @approve="answer = `approved ${$event}`" @deny="answer = `denied ${$event}`" />
			</div>
			<p class="text-sm text-ink-gray-5">Last answer: <span class="text-ink-gray-8">{{ answer || "—" }}</span></p>
		</div>
	</DemoBlock>

	<DemoBlock id="tool-group" title="Tool group" description="Two or more plain steps in a row fold under one summary line. Cards and calls that wait on the person never fold.">
		<ToolGroup v-bind="summarizeSteps(folded, true)">
			<ToolPart v-for="part in folded" :key="part.toolCallId" :part="part" />
		</ToolGroup>
	</DemoBlock>

	<DemoBlock id="tool-compound" title="Tool, composed" description="The parts behind ToolPart, with a long MCP result to check overflow.">
		<Tool default-open>
			<ToolHeader state="output-available" tool-name="get_doctype_schema" icon="lucide-database" />
			<ToolContent>
				<ToolInput :input="{ doctype: 'Volunteer', include_child_tables: true }" />
				<ToolOutput :output="longJsonOutput" />
			</ToolContent>
		</Tool>
	</DemoBlock>

	<DemoBlock id="confirmation" title="Confirmation" part="approval-requested" description="Request, accepted and rejected states of the compound Confirmation.">
		<div class="flex flex-col gap-3">
			<Confirmation
				v-for="(item, i) in [
					{ state: 'approval-requested', approval: { id: 'x' } },
					{ state: 'output-available', approval: { id: 'y', approved: true } },
					{ state: 'output-denied', approval: { id: 'z', approved: false } },
				] as const"
				:key="i"
				:state="item.state"
				:approval="item.approval"
			>
				<ConfirmationTitle>
					<ConfirmationRequest>Create the Volunteer DocType with 4 fields?</ConfirmationRequest>
					<ConfirmationAccepted>You approved creating Volunteer.</ConfirmationAccepted>
					<ConfirmationRejected>You denied creating Volunteer.</ConfirmationRejected>
				</ConfirmationTitle>
				<ConfirmationActions>
					<ConfirmationAction label="Deny" />
					<ConfirmationAction label="Approve" variant="solid" />
				</ConfirmationActions>
			</Confirmation>
		</div>
	</DemoBlock>
</template>
