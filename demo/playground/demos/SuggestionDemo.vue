<script setup lang="ts">
import { computed } from "vue";
import { Suggestion, Suggestions } from "frappe-ui-ai-elements";
import { useLog } from "../log";
import type { Values } from "../types";
import { worst as w } from "../worst";

const props = defineProps<{ v: Values; worst: boolean }>();
const log = useLog();
const pool = ["Track volunteers: name, phone, area and free days", "A sign-up form for our weekend food drive", "Add 20 sample records to Volunteer", "Show donations from last month", "Email volunteers free on Saturday", "Make a donor list"];
const items = computed(() => Array.from({ length: Number(props.v.count) }, (_, i) => (props.worst ? [w.hindi, w.unbroken, w.emoji][i % 3] : pool[i % pool.length])));
</script>

<template>
	<Suggestions :wrap="Boolean(v.wrap)">
		<Suggestion v-for="(s, i) in items" :key="i" :suggestion="s" :icon="v.icon ? 'lucide-sparkles' : undefined" @select="log('select', $event)" />
	</Suggestions>
</template>
