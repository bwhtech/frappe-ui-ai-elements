import DOMPurify from "dompurify";
import { marked, type Token, type Tokens, type TokensList } from "marked";

export type MarkdownBlock = { key: string; kind: "html"; html: string } | { key: string; kind: "code"; code: string; language: string };

/** Turns markdown into blocks; fenced code becomes its own block so it can render as a CodeBlock. */
export class MarkdownRenderer {
	// Finished blocks never change while a reply streams, so cache their HTML by source.
	private cache = new Map<string, string>();

	render(markdown: string, repairIncomplete: boolean): MarkdownBlock[] {
		const source = repairIncomplete ? repairMarkdown(markdown) : markdown;
		const tokens = marked.lexer(source, { gfm: true });
		return tokens.filter((token) => token.type !== "space").map((token, index) => this.toBlock(token, index, tokens.links));
	}

	private toBlock(token: Token, index: number, links: TokensList["links"]): MarkdownBlock {
		if (token.type === "code") {
			const code = token as Tokens.Code;
			return { key: `${index}-code`, kind: "code", code: code.text, language: (code.lang ?? "").split(/\s/)[0] };
		}
		return { key: `${index}-${token.type}`, kind: "html", html: this.html(token, links) };
	}

	private html(token: Token, links: TokensList["links"]) {
		const cached = this.cache.get(token.raw);
		if (cached !== undefined) return cached;
		const list = Object.assign([token], { links }) as unknown as Parameters<typeof marked.parser>[0];
		const clean = DOMPurify.sanitize(marked.parser(list, { gfm: true, breaks: true }), { ADD_ATTR: ["target"] });
		// A wide table scrolls on its own instead of widening the reply. Focusable so keyboards can scroll it.
		const html = token.type === "table" ? `<div data-slot="response-table" tabindex="0" role="region" aria-label="Table">${clean}</div>` : clean;
		if (this.cache.size > 500) this.cache.clear();
		this.cache.set(token.raw, html);
		return html;
	}
}

/**
 * Closes markdown that is still streaming, so half a reply renders like the
 * finished one: an open code fence, bold or inline code, and a link whose URL
 * has not arrived yet.
 */
export function repairMarkdown(text: string) {
	const fences = text.match(/^\s*(```|~~~)/gm)?.length ?? 0;
	if (fences % 2 === 1) return `${text}\n\`\`\``;

	const lastBlock = text.slice(text.lastIndexOf("\n\n") + 1);
	let tail = "";
	const withoutCode = lastBlock.replace(/`[^`\n]*`/g, "");
	if ((withoutCode.match(/`/g)?.length ?? 0) % 2 === 1) tail += "`";
	if ((withoutCode.match(/\*\*/g)?.length ?? 0) % 2 === 1) tail += "**";
	if ((withoutCode.match(/~~/g)?.length ?? 0) % 2 === 1) tail += "~~";
	return (text + tail).replace(/\[([^\]\n]*)\]\([^)\s]*$/, "$1");
}

DOMPurify.addHook("afterSanitizeAttributes", (node) => {
	if (node.tagName === "A" && node.getAttribute("href")?.match(/^https?:/)) {
		node.setAttribute("target", "_blank");
		node.setAttribute("rel", "noreferrer");
	}
});
