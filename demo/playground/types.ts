import type { Component } from "vue";

export type Value = string | number | boolean;
export type Values = Record<string, Value>;
export type Option = string | { label: string; value: string };

export type Control =
	| { key: string; label: string; type: "select" | "segment"; options: Option[]; default: string }
	| { key: string; label: string; type: "boolean"; default: boolean }
	| { key: string; label: string; type: "text" | "textarea"; default: string }
	| { key: string; label: string; type: "range"; min: number; max: number; step?: number; default: number; unit?: string };

export interface Entry {
	id: string;
	label: string;
	group: string;
	description: string;
	controls: Control[];
	/** A demo component taking `v` (control values) and `worst` (stress data on). */
	demo: Component;
}

export function defaults(entry: Entry): Values {
	return Object.fromEntries(entry.controls.map((control) => [control.key, control.default]));
}
