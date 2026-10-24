<script setup lang="ts">
import { DeskCard } from "@bwhtech/frappe-ui-ai-elements";
import DemoBlock from "../DemoBlock.vue";

const desk = "https://example.frappe.cloud/desk";
</script>

<template>
	<DemoBlock
		id="desk-card"
		title="Desk Card"
		description="The agent's show_in_desk call: opens a DocType, a list, a record, a blank form, a public page or a Studio page on the person's site. The server builds the address and counts the records."
	>
		<div class="flex flex-col gap-3">
			<DeskCard
				kind="doctype"
				title="Your new Student Feedback form"
				summary="Name, message and three star ratings: food, teaching and activities."
				doctype="Student Feedback"
				:url="`${desk}/doctype/Student%20Feedback`"
			/>
			<DeskCard
				kind="list"
				title="The 20 sample feedback entries"
				summary="Open the list to see them. Each one is marked Sample, so you can remove them later."
				doctype="Student Feedback"
				:count="20"
				:url="`${desk}/student-feedback`"
			/>
			<DeskCard kind="form" title="Asha Rao's record" doctype="Volunteer" name="VOL-00012" :url="`${desk}/volunteer/VOL-00012`" />
			<DeskCard kind="new" title="Add your first volunteer" doctype="Volunteer" :url="`${desk}/volunteer/new`" />
			<DeskCard
				kind="studio"
				title="Meals dashboard"
				summary="Meals served this month, by centre, with the latest distributions."
				doctype="/annapurna/meals"
				url="https://example.frappe.cloud/annapurna/meals"
				edit-url="https://example.frappe.cloud/studio/app/annapurna/page-1a2b3c4d"
			/>
			<DeskCard kind="page" title="Volunteer sign-up form" summary="Share this link. Anyone can fill it in without an account." doctype="volunteer-sign-up" :url="`https://example.frappe.cloud/volunteer-sign-up`" />
			<DeskCard kind="list" title="Checking the volunteer list…" doctype="Volunteer" />
		</div>
	</DemoBlock>
</template>
