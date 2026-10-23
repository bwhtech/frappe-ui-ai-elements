<script setup lang="ts">
import { computed } from "vue";
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
	TaskTrigger,
	type TraceStatus,
} from "@bwhtech/frappe-ui-ai-elements";
import { useLog } from "../log";
import type { Values } from "../types";
import { worst as w } from "../worst";

/** Task, Plan, Queue and Chain of Thought share one demo; `kind` picks which. */
const props = defineProps<{ v: Values; worst: boolean; kind: "task" | "plan" | "queue" | "chain" }>();
const log = useLog();
const steps = ["Create the Volunteer DocType", "Add the Volunteer Day child table", "Create the web form", "Add an email notification", "Add 20 sample records", "Share the link", "Train the coordinators", "Import last year's list"];
const label = (i: number) => (props.worst ? [w.hindi, w.unbroken, w.name, w.emoji][i % 4] : steps[i % steps.length]);
const count = computed(() => Number(props.v.count));
const done = computed(() => Math.min(Number(props.v.done ?? 0), count.value));
const streaming = computed(() => Boolean(props.v.streaming));
const status = computed(() => (props.v.status === "none" ? undefined : (props.v.status as TraceStatus)));
const stepStatus = (i: number) => (i < done.value ? "complete" : i === done.value ? "active" : "pending");
const taskTitle = computed(() => ({ running: "Updating the Volunteer form", error: "Failed to update the Volunteer form", none: "Updated the Volunteer form" })[String(props.v.status)] ?? "");
</script>

<template>
	<Task v-if="kind === 'task'" :key="String(v.status)" @update:open="log('update:open', $event)">
		<TaskTrigger :title="worst ? w.name : taskTitle" :status="status" />
		<TaskContent>
			<TaskItem v-for="i in count" :key="i" :icon="i === count && status === 'error' ? 'lucide-x' : 'lucide-check'" :status="i === count ? status : undefined">
				{{ label(i - 1) }}
			</TaskItem>
		</TaskContent>
	</Task>

	<Plan v-else-if="kind === 'plan'" :is-streaming="streaming" @update:open="log('update:open', $event)">
		<PlanHeader>
			<PlanTitle>Plan: {{ worst ? w.name : "volunteer sign-up" }}</PlanTitle>
			<PlanDescription>{{ done }} of {{ count }} done</PlanDescription>
		</PlanHeader>
		<PlanContent>
			<template v-if="v.description" #description>{{ worst ? w.marathi : "Build a public form that adds people to Volunteer, then email the coordinator." }}</template>
			<PlanStep v-for="i in count" :key="i" :status="stepStatus(i - 1)">{{ label(i - 1) }}</PlanStep>
		</PlanContent>
	</Plan>

	<Queue v-else-if="kind === 'queue'">
		<QueueSection :label="`${count - done} to do`" default-open>
			<QueueItem
				v-for="i in count - done"
				:key="i"
				:status="i === 1 ? 'in_progress' : 'pending'"
				:streaming="streaming"
				:description="v.description ? (worst ? w.unbroken : 'Ask the coordinator which days the drive runs.') : undefined"
			>
				{{ label(done + i - 1) }}
			</QueueItem>
		</QueueSection>
		<QueueSection v-if="done" :label="`${done} completed`" icon="lucide-list-checks">
			<QueueItem v-for="i in done" :key="i" status="completed">{{ label(i - 1) }}</QueueItem>
		</QueueSection>
	</Queue>

	<ChainOfThought
		v-else
		:key="String(streaming)"
		:title="streaming ? 'Researching' : `Researched in ${count} steps`"
		:running="streaming"
		:status="v.error ? 'error' : undefined"
		default-open
		@update:open="log('update:open', $event)"
	>
		<ChainOfThoughtStep
			v-for="i in count"
			:key="i"
			:label="label(i - 1)"
			:status="v.error && i === 2 ? 'error' : streaming && i === count ? 'active' : 'complete'"
			:icon="i % 2 ? 'lucide-search' : 'lucide-file-text'"
			:description="v.error && i === 2 ? '403' : undefined"
		>
			<ChainOfThoughtSearchResults v-if="i === 1 && v.results" :urls="worst ? [`https://${w.unbroken}.org`, 'https://docs.frappe.io'] : ['https://docs.frappe.io/a', 'https://www.volunteermatch.org/b']" />
		</ChainOfThoughtStep>
	</ChainOfThought>
</template>
