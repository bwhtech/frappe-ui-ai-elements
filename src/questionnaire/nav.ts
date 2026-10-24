import { computed } from "vue";
import { injectQuestionnaire } from "./context";

/** Where the active item sits, for the action buttons. */
export function useQuestionnaireNav(component: string) {
	const root = injectQuestionnaire(component);
	const total = computed(() => root.items.value.length);
	const index = computed(() => root.activeIndex.value);
	const active = computed(() => root.items.value[index.value]);
	return {
		root,
		first: computed(() => index.value <= 0),
		last: computed(() => index.value === total.value - 1),
		optional: computed(() => !!active.value && !active.value.required()),
		status: computed(() => (active.value ? root.statusOf(active.value.name) : "unanswered")),
	};
}
