import { firstVisibleIndex, viewportTop } from "./geometry";

const EPSILON = 0.5;

/**
 * Keeps the reader's place when rows are inserted above them, such as older
 * messages loading. Remembers the first visible message row (a row with a
 * `messageId`, so a pinned "load older" row is never the anchor) after every scroll and
 * content change; when that row's index changes, `restore` scrolls by however
 * far it moved. Where native scroll anchoring already held it, the shift is zero.
 */
export class PrependAnchor {
	private anchor: { element: HTMLElement; index: number; top: number } | null = null;

	capture(items: HTMLElement[], viewport: HTMLElement | null) {
		const index = viewport ? firstVisibleMessage(items, viewport) : -1;
		this.anchor = index < 0 ? null : { element: items[index], index, top: viewportTop(items[index], viewport!) };
	}

	/** Rows were inserted or removed above the remembered row. */
	moved(items: HTMLElement[]) {
		const anchor = this.anchor;
		return !!anchor && anchor.element.isConnected && items.indexOf(anchor.element) !== anchor.index;
	}

	/** Scrolls by however far the remembered row moved. */
	restore(viewport: HTMLElement) {
		if (!this.anchor) return;
		const shift = viewportTop(this.anchor.element, viewport) - this.anchor.top;
		if (Math.abs(shift) > EPSILON) viewport.scrollTop += shift;
	}
}

/** The first visible row with a messageId, else the first visible row. */
function firstVisibleMessage(items: HTMLElement[], viewport: HTMLElement) {
	const first = firstVisibleIndex(items, viewport);
	if (first < 0) return first;
	const bottom = viewport.getBoundingClientRect().bottom;
	for (let index = first; index < items.length && items[index].getBoundingClientRect().top < bottom; index++) {
		if (items[index].dataset.messageId) return index;
	}
	return first;
}
