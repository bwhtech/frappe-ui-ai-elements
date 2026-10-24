<script setup lang="ts">
import { computed } from "vue";
import { injectQuestionnaire } from "./context";

/** "2 of 4". The default slot gets `{ current, total, first, last }` for a custom format. */
const root = injectQuestionnaire("QuestionnaireProgress");
const current = computed(() => root.activeIndex.value + 1);
const total = computed(() => root.items.value.length);
</script>

<template>
	<p data-slot="questionnaire-progress" aria-live="polite" class="shrink-0 text-sm tabular-nums text-ink-gray-5">
		<slot :current="current" :total="total" :first="current === 1" :last="current === total">
			<span class="sr-only">Question </span>{{ current }} of {{ total }}
		</slot>
	</p>
</template>
