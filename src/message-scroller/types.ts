// Public option and command types for MessageScroller.

export type MessageScrollerDefaultScrollPosition = "start" | "end" | "last-anchor";
export type MessageScrollerScrollAlign = "start" | "center" | "end" | "nearest";

export interface MessageScrollerScrollOptions {
	align?: MessageScrollerScrollAlign;
	behavior?: ScrollBehavior;
	scrollMargin?: number;
}

export interface MessageScrollerOptions {
	/** Follow new content at the bottom while the viewport is at the end. */
	autoScroll: boolean;
	/** Where a saved transcript opens on its first non-empty render. */
	defaultScrollPosition: MessageScrollerDefaultScrollPosition;
	/** Distance from an edge that still counts as at the edge. */
	scrollEdgeThreshold: number;
	/** Pixels of the previous item kept visible above a newly anchored row. */
	scrollPreviousItemPeek: number;
	/** Margin on the aligned edge for commands. */
	scrollMargin: number;
}
