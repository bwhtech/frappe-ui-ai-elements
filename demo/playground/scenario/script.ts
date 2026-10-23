import type { DynamicToolUIPart, ReasoningUIPart, TextUIPart, ToolUIPart, UIMessage } from "ai";
import { hugeJson, worst } from "../worst";
import type { ScenarioApi } from "./player";

export type ScenarioBranch = "interactive" | "approve" | "deny" | "error";
export type ScenarioText = "normal" | "worst";

const doctype = {
	doctype: "DocType",
	name: "Volunteer",
	module: "Custom",
	custom: 1,
	fields: [
		{ fieldname: "full_name", label: "Full Name", fieldtype: "Data", reqd: 1 },
		{ fieldname: "phone", label: "Phone", fieldtype: "Data", options: "Phone" },
		{ fieldname: "area", label: "Area", fieldtype: "Link", options: "Territory" },
		{ fieldname: "available_days", label: "Available Days", fieldtype: "Small Text" },
	],
};

const copy = {
	normal: {
		ask: "We run a food bank. Help me track volunteers: their name, phone, area, and the days they are free.",
		reasoning:
			"They want a **volunteer tracker**. This is DocType design, so I should load the doctype-design instructions first.\n\nThen check whether a Volunteer or Member DocType already exists, so I don't make a duplicate. \"Area\" can link to Territory if the site has it.",
		intro: "There is no Volunteer list yet, so I'll create one with four fields. Please approve the change.",
		reply: `Done. I created a **Volunteer** list for you:

| Field | Type |
| --- | --- |
| Full Name | Text, required |
| Phone | Phone |
| Area | Link to Territory |
| Available Days | Short text |

Open it in the Desk at [/desk/volunteer](https://example.org/desk/volunteer). A volunteer record looks like this:

\`\`\`json
{ "doctype": "Volunteer", "full_name": "Asha Rao", "phone": "+91 98450 12345", "area": "Jayanagar", "available_days": "Sat, Sun" }
\`\`\`

Want me to add a sign-up form or some sample volunteers next?`,
		denied: "Okay, I didn't create anything. What would you like to change: the fields, or the name of the list?",
		failed: "I couldn't create the list: the site rejected the field **phone**. I can rename it to **mobile_number** and try again, if you approve.",
	},
	worst: {
		ask: `${worst.hindi} ${worst.emoji}`,
		reasoning: `${worst.marathi}\n\n${worst.unbroken}\n\nThe person wrote in Hindi. I'll answer in Hindi and keep the DocType labels in English.`,
		intro: `${worst.hindi} ${worst.unbroken}`,
		reply: `${worst.marathi}\n\n**${worst.name}**\n\n\`${worst.unbroken}\`\n\n\`\`\`json\n${JSON.stringify(hugeJson(8), null, 2)}\n\`\`\``,
		denied: `${worst.marathi} ${worst.emoji}`,
		failed: `${worst.hindi} \`${worst.unbroken}\``,
	},
};

export const scenarioSuggestions = ["Add a sign-up form", "Add 20 sample volunteers", "Show volunteers free this Saturday"];

let ids = 0;
const id = (prefix: string) => `${prefix}-${++ids}`;

/** The Seva conversation: ask → reasoning → load_skill → search → create (approval) → reply. */
export async function script(api: ScenarioApi, options: { branch: ScenarioBranch; text: ScenarioText }) {
	const text = copy[options.text];
	api.label("The person asks");
	api.push({ id: id("user"), role: "user", parts: [{ type: "text", text: text.ask }] });
	api.setStatus("submitted");
	await api.wait(900);

	const reply = api.push({ id: id("assistant"), role: "assistant", parts: [] });
	api.setStatus("streaming");
	api.label("Reasoning streams");
	const thinking = api.addPart<ReasoningUIPart>(reply, { type: "reasoning", text: "", state: "streaming" });
	await api.stream(thinking, text.reasoning, 4);

	api.label("load_skill runs");
	const skill = api.addPart(reply, {
		type: "tool-load_skill",
		toolCallId: id("call"),
		state: "input-streaming",
		input: { name: "doctype" },
	} as ToolUIPart);
	await api.wait(300);
	api.update(skill, { state: "input-available", input: { name: "doctype-design" } });
	await api.wait(700);
	api.update(skill, { state: "output-available", output: "# DocType design\n\nPrefer few fields with clear labels. Set custom: 1 and module: Custom." });

	api.label("search_doctypes runs");
	const search = api.addPart<DynamicToolUIPart>(reply, {
		type: "dynamic-tool",
		toolName: "search_doctypes",
		toolCallId: id("call"),
		state: "input-available",
		input: { query: ["volunteer", "member"] },
	});
	await api.wait(1100);
	api.update(search, { state: "output-available", output: { content: [{ type: "text", text: '{"results":["Email Group Member"]}' }] } });

	api.label("The agent explains");
	const intro = api.addPart<TextUIPart>(reply, { type: "text", text: "", state: "streaming" });
	await api.stream(intro, text.intro);

	api.label("create_document input streams");
	const create = api.addPart<DynamicToolUIPart>(reply, {
		type: "dynamic-tool",
		toolName: "create_document",
		toolCallId: id("call"),
		state: "input-streaming",
		input: { doctype: "DocType" },
	});
	await api.wait(700);
	api.update(create, { state: "input-available", input: options.text === "worst" ? hugeJson(30) : doctype });
	await api.wait(300);
	const approvalId = id("approval");
	api.update(create, { state: "approval-requested", approval: { id: approvalId } });

	api.label(options.branch === "interactive" ? "Waiting for Approve or Deny" : `Waiting (auto: ${options.branch})`);
	const approved = await api.awaitApproval(options.branch === "interactive" ? null : options.branch !== "deny");

	if (!approved) {
		api.update(create, { state: "output-denied", approval: { id: approvalId, approved: false, reason: "The user denied this change." } });
		api.setStatus("submitted");
		await api.wait(700);
		api.setStatus("streaming");
		api.label("The agent asks what to change");
		await api.stream(api.addPart<TextUIPart>(reply, { type: "text", text: "", state: "streaming" }), text.denied);
		api.setStatus("ready");
		return;
	}

	api.update(create, { state: "approval-responded", approval: { id: approvalId, approved: true } });
	api.setStatus("submitted");
	api.label("create_document runs");
	await api.wait(1400);
	api.setStatus("streaming");

	if (options.branch === "error") {
		api.update(create, {
			state: "output-error",
			errorText: "frappe.exceptions.ValidationError: Fieldname phone is a reserved keyword in DocType Volunteer",
		});
		api.label("The tool failed");
		await api.stream(api.addPart<TextUIPart>(reply, { type: "text", text: "", state: "streaming" }), text.failed);
		api.setStatus("ready");
		return;
	}

	api.update(create, {
		state: "output-available",
		output: { content: [{ type: "text", text: '{"name":"Volunteer","modified":"2026-10-23 18:02:11"}' }] },
	});
	api.label("The final reply streams");
	await api.stream(api.addPart<TextUIPart>(reply, { type: "text", text: "", state: "streaming" }), text.reply, 7);
	api.setStatus("ready");
}

export type { UIMessage };
