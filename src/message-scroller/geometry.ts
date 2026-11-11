// Layout measurements for MessageScroller. All tops are in viewport scroll coordinates.

export function scrollItems(content: HTMLElement, spacer: HTMLElement | null) {
	return Array.from(content.children).filter((child): child is HTMLElement => child instanceof HTMLElement && child !== spacer);
}

export function elementTop(element: HTMLElement, viewport: HTMLElement) {
	return element.getBoundingClientRect().top - viewport.getBoundingClientRect().top + viewport.scrollTop;
}

/** Bottom of the real content (last item plus bottom padding), ignoring the tail spacer. */
export function contentBottom(content: HTMLElement, spacer: HTMLElement | null, viewport: HTMLElement) {
	const items = scrollItems(content, spacer);
	const last = items[items.length - 1];
	const padding = blockPadding(content);
	if (!last) return elementTop(content, viewport) + padding.start + padding.end;
	return elementTop(last, viewport) + last.getBoundingClientRect().height + padding.end;
}

export function blockPadding(element: HTMLElement | null) {
	if (!element) return { start: 0, end: 0 };
	const style = getComputedStyle(element);
	return { start: parseFloat(style.paddingTop) || 0, end: parseFloat(style.paddingBottom) || 0 };
}

export function flexGap(element: HTMLElement | null) {
	if (!element) return 0;
	return parseFloat(getComputedStyle(element).rowGap) || 0;
}

/** Index of the first row crossing the viewport top. Rows are stacked, so binary search works. */
export function firstVisibleIndex(items: HTMLElement[], viewport: HTMLElement) {
	const top = viewport.getBoundingClientRect().top;
	let low = 0;
	let high = items.length - 1;
	let found = -1;
	while (low <= high) {
		const middle = (low + high) >> 1;
		if (items[middle].getBoundingClientRect().bottom > top) {
			found = middle;
			high = middle - 1;
		} else low = middle + 1;
	}
	return found;
}

export function viewportTop(element: HTMLElement, viewport: HTMLElement) {
	return element.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
}
