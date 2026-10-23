import type { Control, Entry, Values } from "./types";

// Query keys owned by the playground shell; component controls use everything else.
export const GLOBAL_KEYS = ["c", "theme", "w", "worst"] as const;

export interface GlobalState {
	component: string;
	theme: "light" | "dark";
	width: "390" | "768" | "full";
	worst: boolean;
}

export function readGlobals(params: URLSearchParams, fallback: string): GlobalState {
	const width = params.get("w");
	return {
		component: params.get("c") ?? fallback,
		theme: params.get("theme") === "dark" ? "dark" : "light",
		width: width === "390" || width === "768" ? width : "full",
		worst: params.get("worst") === "1",
	};
}

/** Control values from the query string, falling back to each control's default. */
export function readValues(params: URLSearchParams, entry: Entry): Values {
	return Object.fromEntries(entry.controls.map((control) => [control.key, parse(control, params.get(control.key))]));
}

/** Writes only what differs from the defaults, so links stay short. */
export function writeUrl(globals: GlobalState, entry: Entry, values: Values) {
	const params = new URLSearchParams({ c: globals.component });
	if (globals.theme === "dark") params.set("theme", "dark");
	if (globals.width !== "full") params.set("w", globals.width);
	if (globals.worst) params.set("worst", "1");
	for (const control of entry.controls) {
		const value = values[control.key];
		if (value !== control.default) params.set(control.key, String(value));
	}
	history.replaceState(null, "", `${location.pathname}?${params}`);
}

function parse(control: Control, raw: string | null) {
	if (raw === null) return control.default;
	if (control.type === "boolean") return raw === "true";
	if (control.type === "range") return Number.isFinite(+raw) ? +raw : control.default;
	return raw;
}
