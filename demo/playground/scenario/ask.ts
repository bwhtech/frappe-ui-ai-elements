import type { AskUserInput, AskUserOutput } from "frappe-ui-ai-elements";
import { worst } from "../worst";

// The ask_user step of the Seva scenario: what the agent asks before it builds
// the volunteer tracker, and how the answers shape what it builds.

export type ScenarioAsk = "interactive" | "form" | "staff" | "skip";

export function volunteerQuestions(isWorst: boolean): AskUserInput {
	return {
		title: isWorst ? `${worst.name}` : "A few questions before I build it",
		questions: [
			{
				id: "fields",
				header: "Fields",
				question: isWorst ? `${worst.hindi}` : "What should each volunteer record hold, besides their name?",
				kind: "multiple",
				options: [
					{ value: "phone", label: "Phone number" },
					{ value: "days", label: "Days they are free" },
					{ value: "skills", label: "Skills", description: "Driving, cooking, packing…" },
					{ value: "emergency_contact", label: isWorst ? worst.unbroken : "Emergency contact" },
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
			{
				id: "areas",
				header: "Areas",
				question: "Which areas do your volunteers cover?",
				kind: "multiple",
				options: ["Jayanagar", "Koramangala", "Indiranagar", "Malleswaram"].map((area) => ({ value: area, label: area })),
				allowOther: true,
			},
			{
				id: "reminder",
				header: "Reminders",
				question: "Which day should shift reminders go out?",
				description: "Skip this if you do not want reminders.",
				kind: "single",
				options: ["Thursday", "Friday", "Saturday"].map((day) => ({ value: day, label: day })),
				required: false,
			},
		],
	};
}

/** What the non-interactive branches answer. */
export const presetAnswers: Record<"form" | "staff", AskUserOutput> = {
	form: { answers: { fields: ["phone", "days", "skills"], signup: "form", areas: ["Jayanagar", "Koramangala", "HSR Layout"], reminder: "Friday" } },
	staff: { answers: { fields: ["phone"], signup: "staff", areas: ["Indiranagar"], reminder: null } },
};

/** The answers the agent assumes when it does not ask. */
export const defaultAnswers: AskUserOutput = { answers: { fields: ["phone", "days"], signup: "staff", areas: ["Jayanagar"], reminder: null } };

const fieldDefs: Record<string, { label: string; fieldtype: string; options?: string }> = {
	phone: { label: "Phone", fieldtype: "Data", options: "Phone" },
	days: { label: "Available Days", fieldtype: "Small Text" },
	skills: { label: "Skills", fieldtype: "Small Text" },
	emergency_contact: { label: "Emergency Contact", fieldtype: "Data", options: "Phone" },
};

/** The create_document input for the answers. */
export function volunteerDoctype(output: AskUserOutput) {
	const { fields, areas } = read(output);
	return {
		doctype: "DocType",
		name: "Volunteer",
		module: "Custom",
		custom: 1,
		fields: [
			{ fieldname: "full_name", label: "Full Name", fieldtype: "Data", reqd: 1 },
			...fields.map((field) => ({ fieldname: fieldname(field), ...(fieldDefs[field] ?? { label: field, fieldtype: "Data" }) })),
			{ fieldname: "area", label: "Area", fieldtype: "Select", options: areas.join("\n") },
		],
	};
}

/** Sentences for the reply that depend on the answers. `asked` is false when the agent assumed them. */
export function describeAnswers(output: AskUserOutput, asked: boolean) {
	const { fields, areas, signup, reminder } = read(output);
	const count = fields.length + 2;
	const signupLine = {
		form: "Next I'll make a public sign-up form, so volunteers can add themselves.",
		staff: "Your team adds volunteers from the Desk; there is no public form.",
		both: "Your team can add volunteers, and I'll also make a public sign-up form.",
	}[signup] ?? "";
	const reminderLine = reminder ? `I'll set up a reminder that goes out every **${reminder}**.` : asked ? "No reminders, as you asked." : "";
	return {
		intro: `${asked ? "Thanks. I'll" : "There is no Volunteer list yet, so I'll"} create a **Volunteer** list with ${count} fields and areas ${areas.map((area) => `**${area}**`).join(", ")}. Please approve the change.`,
		table: [
			"| Field | Type |",
			"| --- | --- |",
			"| Full Name | Text, required |",
			...fields.map((field) => `| ${fieldDefs[field]?.label ?? field} | ${typeLabel(fieldDefs[field])} |`),
			`| Area | One of: ${areas.join(", ")} |`,
		].join("\n"),
		followUp: `${signupLine} ${reminderLine}`.trim(),
		area: areas[0],
	};
}

function typeLabel(def: { fieldtype: string; options?: string } | undefined) {
	if (def?.options === "Phone") return "Phone";
	return def?.fieldtype === "Small Text" ? "Short text" : "Text";
}

function read(output: AskUserOutput) {
	const list = (value: unknown) => (Array.isArray(value) ? value.map(String) : []);
	const areas = list(output.answers.areas);
	return {
		fields: list(output.answers.fields),
		areas: areas.length ? areas : ["Jayanagar"],
		signup: String(output.answers.signup ?? "staff") as "form" | "staff" | "both",
		reminder: typeof output.answers.reminder === "string" ? output.answers.reminder : null,
	};
}

function fieldname(label: string) {
	return label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "custom_field";
}
