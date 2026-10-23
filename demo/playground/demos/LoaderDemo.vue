<script setup lang="ts">
import { Loader, Shimmer } from "@bwhtech/frappe-ui-ai-elements";
import type { Values } from "../types";
import { worst as w } from "../worst";

defineProps<{ v: Values; worst: boolean }>();
</script>

<template>
	<div class="flex flex-col gap-4">
		<Loader :text="worst ? w.hindi : String(v.text)" />
		<Shimmer :as="String(v.as)" :duration="Number(v.duration)" :class="v.as === 'h3' ? 'text-xl-semibold text-ink-gray-9' : 'text-p-base text-ink-gray-6'">
			{{ worst ? w.unbroken : String(v.text) }}
		</Shimmer>
	</div>
</template>
