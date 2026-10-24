/** The `show_in_desk` tool: the agent points the person at something on their Frappe site. */
export const SHOW_IN_DESK_TOOL = "show_in_desk";

export type DeskCardKind = "list" | "form" | "doctype" | "new" | "page" | "studio";

export interface ShowInDeskInput {
	title: string;
	summary?: string;
	kind: DeskCardKind;
	doctype: string;
	name?: string;
	route?: string;
	filters?: Record<string, string | number | boolean>;
}

/** What the server returns: the address it built and, for a list, the record count. */
export interface ShowInDeskOutput {
	url: string;
	kind: DeskCardKind;
	doctype: string;
	name?: string;
	route?: string;
	count?: number;
	/** For a Studio page: where to change it in Studio's editor. */
	editUrl?: string;
}

const KINDS: DeskCardKind[] = ["list", "form", "doctype", "new", "page", "studio"];

export function parseShowInDeskInput(input: unknown): ShowInDeskInput | null {
	const value = input as Partial<ShowInDeskInput> | undefined;
	if (!value || typeof value.title !== "string" || typeof value.doctype !== "string" || !KINDS.includes(value.kind as DeskCardKind)) return null;
	return value as ShowInDeskInput;
}

export function parseShowInDeskOutput(output: unknown): ShowInDeskOutput | null {
	const value = output as Partial<ShowInDeskOutput> | undefined;
	if (!value || typeof value.url !== "string" || !KINDS.includes(value.kind as DeskCardKind)) return null;
	return value as ShowInDeskOutput;
}
