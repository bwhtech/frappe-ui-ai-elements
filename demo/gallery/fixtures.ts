import type { DynamicToolUIPart, UIMessage } from "ai";
import type { ProposePlanInput } from "frappe-ui-ai-elements";

// Realistic parts for a nonprofit building a volunteer tracker on its Frappe site.

const volunteerFields = {
	doctype: "DocType",
	name: "Volunteer",
	module: "Custom",
	custom: 1,
	fields: [
		{ fieldname: "full_name", label: "Full Name", fieldtype: "Data", reqd: 1 },
		{ fieldname: "phone", label: "Phone", fieldtype: "Data", options: "Phone" },
		{ fieldname: "area", label: "Area", fieldtype: "Link", options: "Territory" },
		{ fieldname: "available_days", label: "Available Days", fieldtype: "Table MultiSelect", options: "Volunteer Day" },
	],
};

const searchOutput = {
	content: [{ type: "text", text: JSON.stringify({ results: [{ name: "Member", module: "Non Profit" }, { name: "Territory", module: "Selling" }] }) }],
};

function tool(state: DynamicToolUIPart["state"], extra: Partial<DynamicToolUIPart> = {}): DynamicToolUIPart {
	return { type: "dynamic-tool", toolName: "create_document", toolCallId: `call-${state}`, state, input: volunteerFields, ...extra } as DynamicToolUIPart;
}

/** One part per tool state, in lifecycle order. */
export const toolStates: { label: string; part: DynamicToolUIPart; streaming?: boolean }[] = [
	{ label: "input-streaming", part: tool("input-streaming", { input: { doctype: "DocType", name: "Volun" } }) },
	{ label: "input-available", part: tool("input-available") },
	{ label: "input-available, chat stopped", part: tool("input-available"), streaming: false },
	{ label: "approval-requested", part: tool("approval-requested", { approval: { id: "approval-1" } }) },
	{ label: "approval-responded (approved)", part: tool("approval-responded", { approval: { id: "a2", approved: true } }) },
	{ label: "approval-responded (denied)", part: tool("approval-responded", { approval: { id: "a3", approved: false } }) },
	{
		label: "output-available",
		part: tool("output-available", {
			output: { content: [{ type: "text", text: JSON.stringify({ name: "Volunteer", modified: "2026-10-23 17:40:11" }) }] },
		}),
	},
	{
		label: "output-error",
		part: tool("output-error", { errorText: "ValidationError: Fieldname phone is a reserved keyword in DocType Volunteer" }),
	},
	{ label: "output-denied", part: tool("output-denied", { approval: { id: "a4", approved: false, reason: "The user denied this change." } }) },
];

export const longJsonOutput = {
	content: [
		{
			type: "text",
			text: JSON.stringify({
				doctype: "Volunteer",
				fields: Array.from({ length: 14 }, (_, i) => ({
					fieldname: `field_with_a_really_long_name_number_${i}_that_does_not_wrap_nicely`,
					fieldtype: i % 2 ? "Data" : "Link",
					options: "https://example.org/a/very/long/url/that/keeps/going/and/going/for/testing/overflow",
				})),
			}),
		},
	],
};

export const reasoningText = `The person wants to **track volunteers**. Before creating anything I should check whether a Volunteer or Member DocType already exists, so I do not make a duplicate.

Fields they asked for: name, phone, area, and the days they are free. "Area" fits a Link to Territory if that exists.`;

export const replyMarkdown = `I created a **Volunteer** list for you. Each volunteer has:

| Field | Type | Notes |
| --- | --- | --- |
| Full Name | Text | Required |
| Phone | Phone | |
| Area | Link to Territory | Pick from your existing areas |
| Available Days | Multi-select | Monday to Sunday |

You can find it in the Desk at [/desk/volunteer](https://example.org/desk/volunteer).

Next steps you might want:

1. Add a few volunteers to try it out.
2. Make a **sign-up form** so volunteers can register themselves.

\`\`\`json
{ "doctype": "Volunteer", "full_name": "Asha Rao", "phone": "+91 98450 12345", "area": "Jayanagar" }
\`\`\`

> Tip: \`Available Days\` uses a child table called *Volunteer Day*.`;

export const suggestions = [
	"Track volunteers: name, phone, area and free days",
	"A sign-up form for our weekend food drive",
	"Add 20 sample records to Volunteer",
	"Show donations from last month",
];

let id = 0;
const nextId = () => `m${++id}`;

export function userMessage(text: string): UIMessage {
	return { id: nextId(), role: "user", parts: [{ type: "text", text }] };
}

export const transcript: UIMessage[] = [
	userMessage("We need to track volunteers: name, phone, area and which days they are free."),
	{
		id: nextId(),
		role: "assistant",
		parts: [
			{ type: "reasoning", text: reasoningText, state: "done" },
			{ type: "dynamic-tool", toolName: "search_doctypes", toolCallId: "c1", state: "output-available", input: { query: "volunteer" }, output: searchOutput },
			tool("output-available", { toolCallId: "c2", output: { content: [{ type: "text", text: '{"name":"Volunteer"}' }] }, approval: { id: "a", approved: true } }),
			{ type: "text", text: replyMarkdown, state: "done" },
		],
	},
	userMessage("Add 20 sample records to it."),
	{
		id: nextId(),
		role: "assistant",
		parts: [
			{ type: "text", text: "I will add 20 sample volunteers spread across your areas. Please approve the change." },
			tool("approval-requested", { toolName: "insert_documents", toolCallId: "c3", input: { doctype: "Volunteer", count: 20 }, approval: { id: "approval-2" } }),
		],
	},
];

/** An `ask_user` call before building the volunteer tracker. */
export const volunteerQuestions = {
	title: "A few questions before I build the tracker",
	questions: [
		{
			id: "fields",
			header: "Fields",
			question: "What should each volunteer record hold?",
			kind: "multiple",
			options: [
				{ value: "phone", label: "Phone number" },
				{ value: "area", label: "Area", description: "Linked to your Territory list" },
				{ value: "days", label: "Days they are free" },
				{ value: "skills", label: "Skills", description: "Driving, cooking, packing…" },
			],
			allowOther: true,
		},
		{
			id: "signup",
			header: "Sign-up",
			question: "How do volunteers sign up?",
			kind: "single",
			options: [
				{ value: "form", label: "A public web form", description: "Anyone with the link can sign up" },
				{ value: "staff", label: "Staff add them", description: "Only your team enters volunteers" },
				{ value: "both", label: "Both" },
			],
		},
		{ id: "start", header: "Start", question: "When does the first drive start?", kind: "date", required: false },
	],
} as const;

export const volunteerAnswers = { answers: { fields: ["phone", "area", "T-shirt size"], signup: "both", start: null } };

/** A propose_plan input: what the agent will build for weekend food drives. */
export const foodDrivePlan = {
	title: "Weekend food drives: donors, pledges and a weekly dashboard",
	items: [
		{ id: "donor-table", kind: "table", title: "Donor table", detail: "Name, phone, email, address, notes." },
		{ id: "donation-table", kind: "table", title: "Donation table", detail: "Date, donor, food item, quantity and unit, status pledged or collected." },
		{ id: "coordinator-role", kind: "role", title: "Drive Coordinator role", detail: "Only coordinators and administrators can see or change donors and pledges." },
		{ id: "pledge-form", kind: "web_form", title: "Public food pledge form", detail: "Open to anyone: name, phone, food item, quantity and the date they will bring it." },
		{ id: "pledges-dashboard", kind: "studio_page", title: "Pledges per week dashboard", detail: "Pledges each week, totals pledged and collected, and the latest pledges." },
		{ id: "sample-records", kind: "records", title: "Sample donors and pledges", detail: "About 10 donors and 15 pledges, marked Sample." },
	],
} satisfies ProposePlanInput;

/** Maths, a Mermaid diagram, a number column and a cited link, as Response draws them. */
export const richReplyMarkdown = `Each volunteer's share of the hours is $s_i = h_i / \\sum_j h_j$, so the shares add up to 1:

$$
\\sum_{i=1}^{n} s_i = \\frac{\\sum_i h_i}{\\sum_j h_j} = 1
$$

| Area | Volunteers | Hours |
| --- | --- | --- |
| Jayanagar | 12 | 340.5 |
| Indiranagar | 7 | 1,205 |
| Malleshwaram | 3 | 18 |

\`\`\`mermaid
flowchart LR
  A[Sign-up form] --> B{Approved?}
  B -- Yes --> C[Volunteer]
  B -- No --> D[Follow up]
\`\`\`

The [Frappe docs](https://docs.frappe.io/framework/user/en/basics/doctypes) explain DocTypes in more detail.`;

/** The page the reply above cites: hover its chip to see the card. */
export const richReplyCitations = new Map([
	[
		"docs.frappe.io/framework/user/en/basics/doctypes",
		{
			url: "https://docs.frappe.io/framework/user/en/basics/doctypes",
			title: "DocTypes",
			description: "A DocType is the core building block of any application based on the Frappe Framework. It describes the model and the view of your data.",
		},
	],
]);
