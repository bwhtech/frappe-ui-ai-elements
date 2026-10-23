import type { DynamicToolUIPart, UIMessage } from "ai";

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
