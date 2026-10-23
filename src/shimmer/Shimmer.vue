<script setup lang="ts">
import { computed } from "vue";

/** Text with a sweeping highlight, for live status. `duration` is in seconds. */
const props = withDefaults(defineProps<{ as?: string; duration?: number; spread?: number }>(), {
	as: "span",
	duration: 2,
});

const style = computed(() => ({
	"--shimmer-duration": `${props.duration}s`,
	...(props.spread ? { "--shimmer-spread": `${props.spread}px` } : {}),
}));
</script>

<template>
	<component :is="as" data-slot="shimmer" class="shimmer break-words" :style="style"><slot /></component>
</template>
