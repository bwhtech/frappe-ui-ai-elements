import { inject, provide, type ComputedRef, type InjectionKey, type Ref, type WritableComputedRef } from "vue";

/** One answer. Fixed choices are strings; `multiple` items hold a string array. */
export type QuestionnaireValue = string | number | boolean | string[] | null | undefined;
export type QuestionnaireAnswers = Record<string, QuestionnaireValue>;
export type QuestionnaireItemStatus = "unanswered" | "answered" | "skipped";
export type QuestionnaireShortcuts = "numbers" | "letters" | "none";

export interface QuestionnaireSubmitPayload {
	/** Answers of every enabled item that was answered, keyed by item name. */
	answers: QuestionnaireAnswers;
	/** Names of optional items the person skipped on purpose. */
	skipped: string[];
}

/** What an item tells the root so it can order, validate and drive it. */
export interface RegisteredItem {
	name: string;
	element: Ref<HTMLElement | null>;
	required: () => boolean;
	disabled: () => boolean;
	/** Focuses the selected answer, or the first one. */
	focus: () => void;
	/** Picks the answer at a 0-based position, from a number or letter key. */
	pick: (index: number) => void;
}

export interface QuestionnaireContext {
	disabled: ComputedRef<boolean>;
	shortcuts: ComputedRef<QuestionnaireShortcuts>;
	answers: Ref<QuestionnaireAnswers>;
	/** Enabled items in document order. */
	items: ComputedRef<RegisteredItem[]>;
	activeName: ComputedRef<string | undefined>;
	activeIndex: ComputedRef<number>;
	/** The item showing its validation error, if any. */
	invalidName: Ref<string | null>;
	register: (item: RegisteredItem) => () => void;
	setAnswer: (name: string, value: QuestionnaireValue) => void;
	statusOf: (name: string) => QuestionnaireItemStatus;
	next: () => boolean;
	previous: () => void;
	skip: () => void;
	submit: () => boolean;
}

export interface QuestionnaireItemContext {
	name: string;
	multiple: ComputedRef<boolean>;
	required: ComputedRef<boolean>;
	disabled: ComputedRef<boolean>;
	active: ComputedRef<boolean>;
	invalid: ComputedRef<boolean>;
	status: ComputedRef<QuestionnaireItemStatus>;
	value: WritableComputedRef<QuestionnaireValue>;
	ids: { title: string; description: string; error: string };
	/** Fixed choices and the freeform input register here, in render order, for shortcuts and arrows. */
	registerChoice: (key: string, activate: () => void) => () => void;
	choiceIndex: (key: string) => number;
	isChecked: (value: string) => boolean;
	select: (value: string) => void;
	other: { selected: Ref<boolean>; text: Ref<string>; set: (text: string) => void; choose: () => void };
}

const rootKey: InjectionKey<QuestionnaireContext> = Symbol("Questionnaire");
const itemKey: InjectionKey<QuestionnaireItemContext> = Symbol("QuestionnaireItem");

export function provideQuestionnaire(context: QuestionnaireContext) {
	provide(rootKey, context);
}

export function injectQuestionnaire(component: string) {
	const context = inject(rootKey, null);
	if (!context) throw new Error(`<${component}> must be used inside <Questionnaire>`);
	return context;
}

export function provideQuestionnaireItem(context: QuestionnaireItemContext) {
	provide(itemKey, context);
}

/** The nearest QuestionnaireItem: its value, status and ids. Use it to bind your own control. */
export function useQuestionnaireItem(component = "useQuestionnaireItem") {
	const context = inject(itemKey, null);
	if (!context) throw new Error(`${component} must be used inside <QuestionnaireItem>`);
	return context;
}

export function isAnswered(value: QuestionnaireValue) {
	if (value === undefined || value === null) return false;
	if (typeof value === "string") return value.trim() !== "";
	if (Array.isArray(value)) return value.some((entry) => entry.trim() !== "");
	if (typeof value === "number") return Number.isFinite(value);
	return true;
}

/** The hint for the answer at a 0-based position: "1"–"9" or "A"–"Z". */
export function shortcutLabel(shortcuts: QuestionnaireShortcuts, index: number) {
	if (index < 0) return undefined;
	if (shortcuts === "numbers") return index < 9 ? String(index + 1) : undefined;
	if (shortcuts === "letters") return index < 26 ? String.fromCharCode(65 + index) : undefined;
	return undefined;
}

/** The 0-based answer position for a key, or -1. */
export function shortcutIndex(shortcuts: QuestionnaireShortcuts, event: KeyboardEvent) {
	if (shortcuts === "numbers" && /^Digit[1-9]$/.test(event.code)) return Number(event.code.slice(5)) - 1;
	if (shortcuts === "numbers" && /^Numpad[1-9]$/.test(event.code)) return Number(event.code.slice(6)) - 1;
	if (shortcuts === "letters" && /^Key[A-Z]$/.test(event.code)) return event.code.charCodeAt(3) - 65;
	return -1;
}
