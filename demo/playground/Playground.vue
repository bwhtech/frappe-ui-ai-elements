<script setup lang="ts">
import { navigate } from "../navigate";
import { Button, FrappeUIProvider, Select, Switch, TabButtons, TextInput, Tooltip, toast, useColorScheme } from "frappe-ui";
import { computed, reactive, ref, watch } from "vue";
import ControlField from "./ControlField.vue";
import EventLog from "./EventLog.vue";
import { provideEventLog } from "./log";
import { entries, groups } from "./registry";
import { defaults, type Values } from "./types";
import { readGlobals, readValues, writeUrl } from "./url-state";

const params = new URLSearchParams(location.search);
const globals = reactive(readGlobals(params, "scenario"));
if (!entries.some((entry) => entry.id === globals.component)) globals.component = "scenario";

const entry = computed(() => entries.find((item) => item.id === globals.component)!);
const values = ref<Values>(readValues(params, entry.value));
const search = ref("");
const mountKey = ref(0);
const { entries: logEntries, clear: clearLog } = provideEventLog();
const { setColorScheme } = useColorScheme();

const filteredGroups = computed(() => {
	const query = search.value.trim().toLowerCase();
	return groups
		.map((group) => ({ group, items: entries.filter((item) => item.group === group && item.label.toLowerCase().includes(query)) }))
		.filter((group) => group.items.length);
});
const pickerOptions = computed(() => entries.map((item) => ({ label: `${item.group} · ${item.label}`, value: item.id })));
// The width control sets the component's own width, so add the card's padding and border.
const frameWidth = computed(() => (globals.width === "full" ? undefined : `calc(${globals.width}px + 2.5rem + 2px)`));

function choose(id: string) {
	if (id === globals.component) return;
	globals.component = id;
	values.value = defaults(entry.value);
	clearLog();
}

function reset() {
	values.value = defaults(entry.value);
	mountKey.value++;
}

async function copyLink() {
	await navigator.clipboard.writeText(location.href).catch(() => {});
	toast.success("Link copied");
}

watch(
	() => globals.theme,
	(theme) => setColorScheme(theme),
	{ immediate: true },
);
watch([globals, values], () => writeUrl(globals, entry.value, values.value), { deep: true, immediate: true });
</script>

<template>
	<FrappeUIProvider>
		<div class="flex h-dvh flex-col bg-surface-base text-ink-gray-8">
			<header class="flex min-h-12 shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-outline-gray-1 px-3 py-2 sm:px-5">
				<span class="lucide-flask-conical size-4 text-ink-gray-6" aria-hidden="true" />
				<h1 class="text-base-semibold text-ink-gray-9">Playground</h1>
				<div class="ml-auto flex flex-wrap items-center justify-end gap-2">
					<TabButtons
						v-model="globals.theme"
						:options="[
							{ label: 'Light', value: 'light', icon: 'lucide-sun' },
							{ label: 'Dark', value: 'dark', icon: 'lucide-moon' },
						]"
					/>
					<TabButtons
						v-model="globals.width"
						class="hidden sm:flex"
						:options="[
							{ label: '390', value: '390' },
							{ label: '768', value: '768' },
							{ label: 'Full', value: 'full' },
						]"
					/>
					<Switch v-model="globals.worst" label="Worst case" />
					<div class="flex items-center">
						<Button variant="ghost" icon="lucide-layout-grid" tooltip="Gallery" aria-label="Gallery" @click="navigate('/')" />
					</div>
				</div>
			</header>

			<div class="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
				<nav class="hidden w-56 shrink-0 flex-col border-r border-outline-gray-1 bg-surface-sidebar lg:flex" aria-label="Components">
					<div class="p-2">
						<TextInput v-model="search" placeholder="Filter" aria-label="Filter components">
							<template #prefix><span class="lucide-search size-3.5 text-ink-gray-5" aria-hidden="true" /></template>
						</TextInput>
					</div>
					<div class="min-h-0 flex-1 space-y-3 overflow-y-auto px-2 pb-10">
						<div v-for="{ group, items } in filteredGroups" :key="group" class="space-y-0.5">
							<p class="px-2 pb-1 pt-2 text-xs-medium text-ink-gray-5">{{ group }}</p>
							<button
								v-for="item in items"
								:key="item.id"
								type="button"
								:aria-current="item.id === globals.component ? 'page' : undefined"
								class="flex min-h-7 w-full items-center rounded-4 px-2 py-1 text-left text-sm leading-tight text-ink-gray-7 hover:bg-surface-gray-2 aria-[current=page]:bg-surface-elevation-3 aria-[current=page]:text-ink-gray-9 aria-[current=page]:shadow-sm"
								@click="choose(item.id)"
							>
								{{ item.label }}
							</button>
						</div>
					</div>
				</nav>

				<div class="border-b border-outline-gray-1 p-3 lg:hidden">
					<Select
						class="w-full"
						:model-value="globals.component"
						:options="pickerOptions"
						aria-label="Component"
						@update:model-value="choose(String($event))"
					/>
				</div>

				<main class="flex min-w-0 flex-1 flex-col gap-3 bg-surface-gray-1 p-3 sm:p-5 lg:overflow-y-auto">
					<div class="flex min-w-0 items-start gap-2">
						<div class="min-w-0 flex-1">
							<h2 class="text-lg-semibold text-ink-gray-9">{{ entry.label }}</h2>
							<p class="mt-1 text-p-sm text-ink-gray-5">{{ entry.description }}</p>
						</div>
						<Tooltip text="Remount the preview">
							<Button size="sm" variant="ghost" icon="lucide-rotate-ccw" aria-label="Remount" @click="mountKey++" />
						</Tooltip>
					</div>
					<div class="mx-auto w-full min-w-0 transition-[max-width] duration-200 motion-reduce:transition-none" :style="{ maxWidth: frameWidth }">
						<div data-preview class="min-w-0 rounded-6 border border-outline-gray-1 bg-surface-base p-4 shadow-sm sm:p-5">
							<component :is="entry.demo" :key="`${entry.id}-${mountKey}`" :v="values" :worst="globals.worst" />
						</div>
					</div>
					<div class="mx-auto w-full" :style="{ maxWidth: frameWidth }">
						<EventLog :entries="logEntries" @clear="clearLog" />
					</div>
				</main>

				<aside class="w-full shrink-0 border-t border-outline-gray-1 lg:w-72 lg:overflow-y-auto lg:border-l lg:border-t-0" aria-label="Controls">
					<div class="flex items-center gap-1 border-b border-outline-gray-1 px-4 py-2.5">
						<h2 class="text-sm-medium text-ink-gray-8">Controls</h2>
						<Button class="ml-auto" size="xs" variant="ghost" icon-left="lucide-link" label="Copy link" @click="copyLink" />
						<Button size="xs" variant="ghost" label="Reset" @click="reset" />
					</div>
					<div class="space-y-4 px-4 pb-10 pt-4">
						<ControlField v-for="control in entry.controls" :key="`${entry.id}-${control.key}`" v-model="values[control.key]" :control="control" />
						<p v-if="!entry.controls.length" class="text-p-sm text-ink-gray-5">No controls for this element.</p>
					</div>
				</aside>
			</div>
		</div>
	</FrappeUIProvider>
</template>
