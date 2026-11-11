<script setup lang="ts">
import { Button, Tooltip } from "frappe-ui";
import { nextTick, ref, watch } from "vue";
import CollapseTransition from "../utils/CollapseTransition.vue";

export interface QueuedMessage {
	id: string;
	text: string;
	/** How many files go with it; shown as a count. */
	files?: number;
}

/**
 * Messages the person wrote while the agent was still working. Sits on top of the
 * PromptInput. Each row can be dragged into a new order, edited in place, removed,
 * or sent now with Steer (the page stops the current reply first). The page owns
 * the list and sends the first item when the agent is free.
 */
const props = defineProps<{ items: QueuedMessage[] }>();
const emit = defineEmits<{
	steer: [id: string];
	remove: [id: string];
	update: [id: string, text: string];
	reorder: [ids: string[]];
}>();
const open = defineModel<boolean>("open", { default: true });

/** The row being edited. The page holds it back from sending until the edit is saved or dropped. */
const editing = defineModel<string | null>("editing", { default: null });
const draft = ref("");
const editor = ref<HTMLTextAreaElement[]>([]);
const dragged = ref<string | null>(null);
const over = ref<string | null>(null);

// The page sent or removed the row being edited: drop the edit, there is nothing left to save it to.
watch(
	() => props.items.map((item) => item.id),
	(ids) => {
		if (editing.value && !ids.includes(editing.value)) {
			editing.value = null;
			draft.value = "";
		}
	},
);

async function edit(item: QueuedMessage) {
	editing.value = item.id;
	draft.value = item.text;
	await nextTick();
	editor.value[0]?.focus();
}

function save() {
	if (editing.value && draft.value.trim()) emit("update", editing.value, draft.value.trim());
	editing.value = null;
}

function onEditKeydown(event: KeyboardEvent) {
	if (event.key === "Escape") editing.value = null;
	else if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
		event.preventDefault();
		save();
	}
}

function onDrop(target: string) {
	const from = dragged.value;
	dragged.value = over.value = null;
	if (!from || from === target) return;
	const ids = props.items.map((item) => item.id).filter((id) => id !== from);
	const at = ids.indexOf(target);
	// Either row may have been sent while it was dragged.
	if (at === -1 || ids.length === props.items.length) return;
	ids.splice(at, 0, from);
	emit("reorder", ids);
}
</script>

<template>
	<!-- The panel and its list grow and shrink, so the field below moves instead of jumping.
	     Each wrapper has no padding or border, so height 0 is fully closed. -->
	<CollapseTransition>
		<div v-if="items.length">
			<section
				data-slot="prompt-input-queue"
				class="mx-3 rounded-t-6 border border-b-0 border-outline-gray-2 bg-surface-gray-1 text-ink-gray-7"
				aria-label="Queued messages"
			>
				<button
					type="button"
					class="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-ink-gray-5 hover:text-ink-gray-7 active:bg-surface-gray-2"
					:aria-expanded="open"
					@click="open = !open"
				>
					<span class="lucide-list-ordered size-4" aria-hidden="true" />
					<span class="flex-1 text-left">Queued</span>
					<span class="tabular-nums">{{ items.length }}</span>
					<span class="lucide-chevron-down size-4 transition-transform duration-200 ease-out-strong motion-reduce:transition-none" :class="!open && '-rotate-90'" aria-hidden="true" />
				</button>
				<CollapseTransition>
					<div v-show="open">
						<ol class="pb-1">
							<li
								v-for="item in items"
								:key="item.id"
								data-slot="prompt-input-queue-item"
								class="group flex items-center gap-1.5 py-0.5 pl-1.5 pr-2 [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:gap-x-4"
								:class="over === item.id && dragged !== item.id && 'shadow-[inset_0_2px_0_var(--outline-gray-4)]'"
								@dragover.prevent="over = item.id"
								@dragleave="over === item.id && (over = null)"
								@drop.prevent="onDrop(item.id)"
							>
								<span
									class="lucide-grip-vertical size-4 shrink-0 cursor-grab text-ink-gray-4"
									:class="items.length < 2 && 'invisible'"
									draggable="true"
									aria-hidden="true"
									@dragstart="dragged = item.id"
									@dragend="dragged = over = null"
								/>
								<textarea
									v-if="editing === item.id"
									ref="editor"
									v-model="draft"
									rows="1"
									class="min-w-0 flex-1 resize-none rounded-4 border-outline-gray-2 bg-surface-base px-2 py-1 text-base text-ink-gray-8 focus:border-outline-gray-4 focus:ring-0"
									aria-label="Edit queued message"
									@keydown="onEditKeydown"
									@blur="save"
								/>
								<p v-else class="min-w-0 flex-1 truncate text-base text-ink-gray-8" :title="item.text">
									{{ item.text }}
									<span v-if="item.files" class="ml-1 inline-flex items-center gap-0.5 text-sm text-ink-gray-5">
										<span class="lucide-paperclip size-3" aria-hidden="true" />{{ item.files }}
									</span>
								</p>
								<Tooltip text="Edit">
									<Button variant="ghost" size="sm" class="touch-target" icon="lucide-pencil" aria-label="Edit" @click="edit(item)" />
								</Tooltip>
								<Tooltip text="Stop the current reply and send this now">
									<Button variant="ghost" size="sm" class="touch-target" icon-left="lucide-corner-up-right" label="Steer" @click="emit('steer', item.id)" />
								</Tooltip>
								<Tooltip text="Remove">
									<Button variant="ghost" size="sm" class="touch-target" icon="lucide-x" aria-label="Remove" @click="emit('remove', item.id)" />
								</Tooltip>
							</li>
						</ol>
					</div>
				</CollapseTransition>
			</section>
		</div>
	</CollapseTransition>
</template>
