import { inject, provide, type InjectionKey } from "vue";

/** A file that a message links to: an attachment chip or an image thumbnail. */
export type ViewedFile = { name: string; url: string; mediaType: string };

/**
 * An app's own viewer for files in the chat, such as a side panel. It returns true when it
 * opened the file; the link then does not navigate. It returns false for files it cannot
 * show, which then open as a link. Without a viewer, every file opens as a link.
 */
export type FileViewer = (file: ViewedFile) => boolean;

const KEY: InjectionKey<FileViewer> = Symbol("file-viewer");

export function provideFileViewer(viewer: FileViewer) {
	provide(KEY, viewer);
}

export function useFileViewer(): FileViewer {
	return inject(KEY, () => false);
}

/**
 * The click handler for a link to a file. A plain click goes to the app's viewer. A click
 * with a modifier key or the middle button opens the link as the browser would.
 */
export function useViewOnClick() {
	const viewer = useFileViewer();
	return (event: MouseEvent, file: ViewedFile) => {
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		if (viewer(file)) event.preventDefault();
	};
}
