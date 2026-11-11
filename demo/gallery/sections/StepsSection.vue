<script setup lang="ts">
import {
	ChainOfThought,
	ChainOfThoughtSearchResults,
	ChainOfThoughtStep,
	Plan,
	PlanContent,
	PlanDescription,
	PlanHeader,
	PlanStep,
	PlanTitle,
	Queue,
	QueueItem,
	QueueSection,
	Task,
	TaskContent,
	TaskItem,
	TaskItemFile,
	TaskTrigger,
} from "frappe-ui-ai-elements";
import { Button } from "frappe-ui";
import DemoBlock from "../DemoBlock.vue";
</script>

<template>
	<DemoBlock id="steps" title="Task" part="data-task" description="A task and its steps, present tense while running, past tense when done.">
		<div class="flex flex-col gap-3">
			<Task>
				<TaskTrigger title="Updating the Volunteer form" status="running" />
				<TaskContent>
					<TaskItem icon="lucide-search">Searched for <TaskItemFile>Volunteer</TaskItemFile></TaskItem>
					<TaskItem icon="lucide-file-text">Read the field list</TaskItem>
					<TaskItem icon="lucide-pencil" status="running">Adding an Emergency Contact field</TaskItem>
				</TaskContent>
			</Task>
			<Task :default-open="false">
				<TaskTrigger title="Created the Donation DocType" />
				<TaskContent><TaskItem icon="lucide-check">Added 6 fields</TaskItem></TaskContent>
			</Task>
			<Task :default-open="false">
				<TaskTrigger title="Failed to publish the web form" status="error" />
				<TaskContent><TaskItem icon="lucide-x" status="error">Route /volunteer-signup is taken</TaskItem></TaskContent>
			</Task>
		</div>
	</DemoBlock>

	<DemoBlock id="plan" title="Plan" part="data-plan" description="The steps the agent plans to take and how far it has got.">
		<Plan is-streaming>
			<PlanHeader>
				<PlanTitle>Plan: volunteer sign-up</PlanTitle>
				<PlanDescription>2 of 5 done</PlanDescription>
				<template #actions><Button size="xs" variant="ghost" label="Edit plan" /></template>
			</PlanHeader>
			<PlanContent>
				<template #description>Build a public form that adds people to Volunteer, then email the coordinator.</template>
				<PlanStep status="complete">Create the Volunteer DocType</PlanStep>
				<PlanStep status="complete">Add the Volunteer Day child table</PlanStep>
				<PlanStep status="active">Create the web form at /volunteer-signup</PlanStep>
				<PlanStep>Add an email notification</PlanStep>
				<PlanStep>Add 20 sample records</PlanStep>
			</PlanContent>
		</Plan>
	</DemoBlock>

	<DemoBlock id="queue" title="Queue" part="tool-writeTodos" description="The agent's todo list, split into what is left and what is done.">
		<Queue>
			<QueueSection label="3 to do" default-open>
				<QueueItem status="in_progress">Create the web form</QueueItem>
				<QueueItem description="The coordinator's email lives in Volunteer Settings.">Add an email notification</QueueItem>
				<QueueItem>Add 20 sample records</QueueItem>
			</QueueSection>
			<QueueSection label="2 completed" icon="lucide-list-checks">
				<QueueItem status="completed">Create the Volunteer DocType</QueueItem>
				<QueueItem status="completed">Add the Volunteer Day child table</QueueItem>
			</QueueSection>
		</Queue>
	</DemoBlock>

	<DemoBlock id="chain-of-thought" title="Chain of Thought" description="A summary that expands into the steps an agent took.">
		<div class="flex flex-col gap-4">
			<ChainOfThought title="Researched in 4 steps" default-open>
				<ChainOfThoughtStep label="Searched DocTypes for volunteer" icon="lucide-search" />
				<ChainOfThoughtStep label="Searched the web for nonprofit volunteer fields" icon="lucide-globe">
					<ChainOfThoughtSearchResults :urls="['https://www.volunteermatch.org/a', 'https://docs.frappe.io/b', 'https://www.idealist.org/c']" />
				</ChainOfThoughtStep>
				<ChainOfThoughtStep label="Failed to read the Territory list" status="error" description="403" />
				<ChainOfThoughtStep label="Reading the Member DocType" status="active" icon="lucide-file-text" />
				<ChainOfThoughtStep label="Compare with Member" status="pending" icon="lucide-circle" />
			</ChainOfThought>
			<ChainOfThought title="Researching" running>
				<ChainOfThoughtStep label="Searching DocTypes for donation" status="active" icon="lucide-search" />
			</ChainOfThought>
		</div>
	</DemoBlock>
</template>
