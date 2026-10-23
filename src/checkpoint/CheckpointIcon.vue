<script setup lang="ts">
import type { Component } from "vue";
import { MarkerIcon } from "../marker";

withDefaults(defineProps<{ icon?: string | Component }>(), { icon: "lucide-bookmark" });
</script>

<template>
	<MarkerIcon :icon="icon" />
</template>
