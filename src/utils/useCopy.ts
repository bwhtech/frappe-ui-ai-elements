import { onBeforeUnmount, ref } from "vue";

/** Clipboard copy with a `copied` flag that resets after `resetMs`. */
export function useCopy(resetMs = 2000) {
	const copied = ref(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy(text: string) {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			return false;
		}
		copied.value = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied.value = false), resetMs);
		return true;
	}

	onBeforeUnmount(() => clearTimeout(timer));
	return { copied, copy };
}
