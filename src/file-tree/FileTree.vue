<script setup lang="ts">
import { Tree, type TreeKey } from "frappe-ui";

// A type alias (not an interface) so it fits frappe-ui's indexable TreeNode.
export type FileTreeNode = {
	path: string;
	name: string;
	children?: FileTreeNode[];
	/** e.g. "added", "modified", "deleted": shown as a trailing marker. */
	change?: "added" | "modified" | "deleted";
};

/**
 * The files the agent changed, as a folder tree. Built on frappe-ui's Tree.
 * `v-model:expanded` holds open folder paths; `v-model:selected` the chosen file.
 */
defineProps<{ nodes: FileTreeNode[] }>();
const expanded = defineModel<TreeKey[]>("expanded", { default: () => [] });
const selected = defineModel<string>("selected");
const emit = defineEmits<{ select: [path: string] }>();

const changeClass = { added: "text-ink-green-6", modified: "text-ink-amber-6", deleted: "text-ink-red-6" };
const changeLetter = { added: "A", modified: "M", deleted: "D" };

function choose(node: FileTreeNode) {
	if (node.children) return;
	selected.value = node.path;
	emit("select", node.path);
}
</script>

<template>
	<div data-slot="file-tree" class="font-mono text-sm">
		<Tree v-model:expanded="expanded" :nodes="nodes" node-key="path" guides="lines">
			<template #item-prefix="{ node, expanded: isOpen }">
				<span
					:class="[node.children ? (isOpen ? 'lucide-folder-open' : 'lucide-folder') : 'lucide-file', 'size-4 shrink-0 text-ink-gray-5']"
					aria-hidden="true"
				/>
			</template>
			<template #item-label="{ node }">
				<button
					type="button"
					class="min-w-0 truncate text-left leading-tighter"
					:class="node.path === selected ? 'text-base-medium text-ink-gray-9' : 'text-base text-ink-gray-7'"
					@click="choose(node as unknown as FileTreeNode)"
				>
					{{ node.name }}
				</button>
			</template>
			<template #item-suffix="{ node }">
				<span v-if="node.change" :class="['ml-auto pr-1 text-xs-medium', changeClass[node.change as keyof typeof changeClass]]">
					{{ changeLetter[node.change as keyof typeof changeLetter] }}
				</span>
			</template>
		</Tree>
	</div>
</template>
