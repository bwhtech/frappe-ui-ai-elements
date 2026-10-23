<script setup lang="ts">
import { computed } from "vue";
import { formatToolInput } from "./state";
import ToolSection from "./ToolSection.vue";

const props = withDefaults(defineProps<{ input: unknown; label?: string }>(), { label: "Parameters" });
const code = computed(() => formatToolInput(props.input));
</script>

<template>
	<ToolSection v-if="code" data-slot="tool-input" :label="label" :code="code" language="json" />
</template>
