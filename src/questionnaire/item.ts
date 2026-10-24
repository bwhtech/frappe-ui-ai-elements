import { computed, ref, shallowReactive } from "vue";
import type { QuestionnaireContext, QuestionnaireValue } from "./context";

export const OTHER_KEY = "__questionnaire-other__";

/**
 * The answer of one item and the choices that edit it. A single item holds a
 * string; a multiple item a string array. The freeform "other" text is part of
 * the answer: the string itself for a single item, one more entry for a multiple one.
 */
export function useItemAnswer(root: QuestionnaireContext, name: () => string, multiple: () => boolean) {
	const choices = shallowReactive<{ key: string; activate: () => void }[]>([]);
	const value = computed<QuestionnaireValue>({
		get: () => root.answers.value[name()],
		set: (next) => root.setAnswer(name(), next),
	});
	const otherSelected = ref(false);
	const otherText = ref("");

	const fixedKeys = () => new Set(choices.map((choice) => choice.key).filter((key) => key !== OTHER_KEY));
	const otherEntry = () => (otherSelected.value && otherText.value.trim() ? [otherText.value] : []);

	/** Checked fixed values of a multiple item. */
	function fixedChecked() {
		const keys = fixedKeys();
		return Array.isArray(value.value) ? value.value.filter((entry) => keys.has(entry)) : [];
	}

	function isChecked(choice: string) {
		if (multiple()) return fixedChecked().includes(choice);
		return !otherSelected.value && value.value === choice;
	}

	/** Picks a fixed choice: replaces a single answer, toggles a multiple one. */
	function select(choice: string) {
		if (!multiple()) {
			otherSelected.value = false;
			value.value = choice;
			return;
		}
		const checked = fixedChecked();
		const next = checked.includes(choice) ? checked.filter((entry) => entry !== choice) : [...checked, choice];
		value.value = [...next, ...otherEntry()];
	}

	function setOther(text: string) {
		otherText.value = text;
		if (text.trim()) otherSelected.value = true;
		commitOther();
	}

	/** Picks the freeform answer: selects it for a single item, toggles it for a multiple one. */
	function chooseOther() {
		otherSelected.value = multiple() ? !otherSelected.value : true;
		commitOther();
	}

	function commitOther() {
		if (multiple()) value.value = [...fixedChecked(), ...otherEntry()];
		else if (otherSelected.value) value.value = otherText.value.trim() ? otherText.value : undefined;
	}

	function registerChoice(key: string, activate: () => void) {
		const entry = { key, activate };
		// The freeform input always sits last, whatever order the parts mount in.
		if (key !== OTHER_KEY && choices.at(-1)?.key === OTHER_KEY) choices.splice(choices.length - 1, 0, entry);
		else choices.push(entry);
		return () => choices.splice(choices.indexOf(entry), 1);
	}

	return {
		value,
		registerChoice,
		choiceIndex: (key: string) => choices.findIndex((choice) => choice.key === key),
		activate: (index: number) => choices[index]?.activate(),
		isChecked,
		select,
		other: { selected: otherSelected, text: otherText, set: setOther, choose: chooseOther },
	};
}
