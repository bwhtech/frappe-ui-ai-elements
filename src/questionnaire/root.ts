import { computed, nextTick, ref, shallowReactive, type Ref } from "vue";
import {
	isAnswered,
	shortcutIndex,
	type QuestionnaireAnswers,
	type QuestionnaireContext,
	type QuestionnaireShortcuts,
	type QuestionnaireSubmitPayload,
	type QuestionnaireValue,
	type RegisteredItem,
} from "./context";

interface RootOptions {
	answers: Ref<QuestionnaireAnswers>;
	item: Ref<string | undefined>;
	disabled: () => boolean;
	shortcuts: () => QuestionnaireShortcuts;
	element: Ref<HTMLElement | null>;
	onSubmit: (payload: QuestionnaireSubmitPayload) => void;
}

/**
 * The state behind <Questionnaire>: registered items in document order, the
 * active one, skip marks and validation. Moving forward validates the active
 * item; submitting validates them all and opens the first invalid one.
 */
export function createQuestionnaire(options: RootOptions) {
	const registered = shallowReactive<RegisteredItem[]>([]);
	const skipped = ref(new Set<string>());
	const invalidName = ref<string | null>(null);

	const items = computed(() => registered.filter((item) => !item.disabled()).toSorted(byDocumentOrder));
	const activeName = computed(() => {
		const wanted = options.item.value;
		return items.value.some((item) => item.name === wanted) ? wanted : items.value[0]?.name;
	});
	const activeIndex = computed(() => items.value.findIndex((item) => item.name === activeName.value));
	const active = () => items.value[activeIndex.value];

	function register(item: RegisteredItem) {
		registered.push(item);
		return () => registered.splice(registered.indexOf(item), 1);
	}

	function setAnswer(name: string, value: QuestionnaireValue) {
		options.answers.value = { ...options.answers.value, [name]: value };
		if (skipped.value.has(name)) skipped.value = without(skipped.value, name);
		if (invalidName.value === name && isAnswered(value)) invalidName.value = null;
	}

	function statusOf(name: string) {
		if (skipped.value.has(name)) return "skipped" as const;
		return isAnswered(options.answers.value[name]) ? ("answered" as const) : ("unanswered" as const);
	}

	function isValid(item: RegisteredItem) {
		return !item.required() || statusOf(item.name) === "answered";
	}

	function goTo(item: RegisteredItem | undefined) {
		if (!item) return;
		// Only move focus when it is already inside: never steal it from the page.
		const hadFocus = !!options.element.value?.contains(document.activeElement);
		options.item.value = item.name;
		if (hadFocus) void nextTick(item.focus);
	}

	function showInvalid(item: RegisteredItem) {
		invalidName.value = item.name;
		goTo(item);
		void nextTick(item.focus);
	}

	function next() {
		const item = active();
		if (!item || options.disabled()) return false;
		if (!isValid(item)) return (showInvalid(item), false);
		invalidName.value = null;
		goTo(items.value[activeIndex.value + 1]);
		return true;
	}

	function previous() {
		if (options.disabled()) return;
		invalidName.value = null;
		goTo(items.value[activeIndex.value - 1]);
	}

	/** Marks an optional item as skipped on purpose and moves on; on the last item, submits. */
	function skip() {
		const item = active();
		if (!item || item.required() || options.disabled()) return;
		const { [item.name]: _dropped, ...rest } = options.answers.value;
		options.answers.value = rest;
		skipped.value = new Set(skipped.value).add(item.name);
		invalidName.value = null;
		const following = items.value[activeIndex.value + 1];
		if (following) goTo(following);
		else submit();
	}

	function submit() {
		if (options.disabled()) return false;
		const invalid = items.value.find((item) => !isValid(item));
		if (invalid) return (showInvalid(invalid), false);
		invalidName.value = null;
		const answered = items.value.filter((item) => statusOf(item.name) === "answered");
		options.onSubmit({
			answers: Object.fromEntries(answered.map((item) => [item.name, options.answers.value[item.name]])),
			skipped: items.value.filter((item) => statusOf(item.name) === "skipped").map((item) => item.name),
		});
		return true;
	}

	const context: QuestionnaireContext = {
		disabled: computed(options.disabled),
		shortcuts: computed(options.shortcuts),
		answers: options.answers,
		items,
		activeName,
		activeIndex,
		invalidName,
		register,
		setAnswer,
		statusOf,
		next,
		previous,
		skip,
		submit,
	};
	return { context, onKeydown: (event: KeyboardEvent) => handleKey(context, active, event) };
}

/**
 * Number or letter keys pick an answer, Enter continues (or submits on the
 * last item), Mod+Enter continues from anywhere. Escape is left alone, so it
 * never skips or leaves a question. Popups and native controls keep their keys.
 */
function handleKey(context: QuestionnaireContext, active: () => RegisteredItem | undefined, event: KeyboardEvent) {
	if (event.defaultPrevented || event.isComposing || context.disabled.value) return;
	const target = event.target as HTMLElement;
	if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) return advance(context, event);
	if (event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return;
	if (event.key === "Enter" && !ownsEnter(target)) return advance(context, event);
	const index = isTextEntry(target) || isPopupControl(target) ? -1 : shortcutIndex(context.shortcuts.value, event);
	if (index >= 0) {
		event.preventDefault();
		active()?.pick(index);
	}
}

function advance(context: QuestionnaireContext, event: KeyboardEvent) {
	event.preventDefault();
	const last = context.activeIndex.value === context.items.value.length - 1;
	if (last) context.submit();
	else context.next();
}

function isTextEntry(element: HTMLElement) {
	if (element.isContentEditable || element instanceof HTMLTextAreaElement) return true;
	return element instanceof HTMLInputElement && !["checkbox", "radio", "button", "submit", "reset"].includes(element.type);
}

/** Buttons, links, textareas and popup triggers handle Enter themselves. */
function ownsEnter(element: HTMLElement) {
	if (element instanceof HTMLTextAreaElement || element.isContentEditable) return true;
	if (element.closest("button, a[href], [role=listbox], [role=menu], [role=dialog]")) return true;
	return isPopupControl(element);
}

function isPopupControl(element: HTMLElement) {
	return element.getAttribute("role") === "combobox" || element.hasAttribute("aria-haspopup") || element.getAttribute("aria-expanded") === "true";
}

function byDocumentOrder(a: RegisteredItem, b: RegisteredItem) {
	const first = a.element.value;
	const second = b.element.value;
	if (!first || !second) return 0;
	return first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

function without(set: Set<string>, name: string) {
	const next = new Set(set);
	next.delete(name);
	return next;
}
