import type { AskUserInput, AskUserKind, AskUserQuestion } from "frappe-ui-ai-elements";
import { worst as w } from "../worst";

const areas = ["Jayanagar", "Koramangala", "Indiranagar", "Malleswaram", "Whitefield", "Yelahanka", "Banashankari", "Hebbal", "Rajajinagar", "Basavanagudi", "Marathahalli", "Electronic City", "BTM Layout", "HSR Layout", "Ulsoor", "Frazer Town", "RT Nagar", "Vijayanagar", "Kengeri", "JP Nagar"];

const base: Record<AskUserKind, Omit<AskUserQuestion, "id" | "kind">> = {
	single: { header: "Sign-up", question: "How do volunteers sign up?", description: "You can change this later." },
	multiple: { header: "Areas", question: "Which areas do you cover?", description: "Pick all that apply." },
	text: { header: "Name", question: "What should the list be called?", placeholder: "e.g. Volunteer" },
	number: { header: "Shift", question: "How many hours is one shift?", placeholder: "3" },
	date: { header: "Start", question: "When does the first drive start?" },
	boolean: { header: "Reminders", question: "Send volunteers a reminder the day before?" },
};

function options(kind: AskUserKind, count: number, isWorst: boolean) {
	if (kind === "single" && count <= 3 && !isWorst) {
		return [
			{ value: "form", label: "A public web form", description: "Anyone with the link can sign up" },
			{ value: "staff", label: "Staff add them", description: "Only your team enters volunteers" },
			{ value: "both", label: "Both" },
		].slice(0, count);
	}
	return Array.from({ length: count }, (_, i) =>
		isWorst
			? { value: `v${i}`, label: i % 2 ? w.unbroken : `${w.hindi} ${i + 1}`, description: i % 3 ? w.marathi : undefined }
			: { value: areas[i % areas.length].toLowerCase().replace(/\s+/g, "-") + (i >= areas.length ? `-${i}` : ""), label: areas[i % areas.length] + (i >= areas.length ? ` ${i}` : "") },
	);
}

/** Builds the playground's ask_user input from its controls. */
export function buildAskUserInput(settings: { kinds: AskUserKind[]; optionCount: number; allowOther: boolean; required: boolean; worst: boolean }): AskUserInput {
	const questions = settings.kinds.map((kind, i): AskUserQuestion => {
		const sample = base[kind];
		const hasOptions = kind === "single" || kind === "multiple";
		return {
			...sample,
			id: `q${i + 1}-${kind}`,
			kind,
			header: settings.worst ? `${w.name} ${i + 1}` : sample.header,
			question: settings.worst ? `${w.hindi} ${w.unbroken}?` : sample.question,
			description: settings.worst ? w.marathi : sample.description,
			options: hasOptions ? options(kind, settings.optionCount, settings.worst) : undefined,
			allowOther: hasOptions && settings.allowOther,
			required: settings.required,
		};
	});
	return { title: settings.worst ? `${w.name} ${w.emoji}` : "A few questions before I start", questions };
}
