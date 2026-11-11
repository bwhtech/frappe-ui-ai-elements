import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import diff from "highlight.js/lib/languages/diff";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";

// highlight.js is what frappe-ui's editor code blocks use (through lowlight).
// Only a small set of languages is registered to keep the bundle light.
const languages = { bash, css, diff, javascript, json, markdown, python, sql, typescript, xml, yaml };
for (const [name, language] of Object.entries(languages)) hljs.registerLanguage(name, language);
hljs.registerAliases(["sh", "shell", "zsh", "console"], { languageName: "bash" });
hljs.registerAliases(["js", "jsx", "mjs", "vue"], { languageName: "javascript" });
hljs.registerAliases(["ts", "tsx"], { languageName: "typescript" });
hljs.registerAliases(["html", "svg"], { languageName: "xml" });
hljs.registerAliases(["py", "jinja"], { languageName: "python" });
hljs.registerAliases(["yml"], { languageName: "yaml" });
hljs.registerAliases(["md"], { languageName: "markdown" });

/** Highlights `code` and returns one HTML string per line. Unknown languages are escaped only. */
export function highlightLines(code: string, language?: string): string[] {
	const source = code.replace(/\n$/, "");
	const html = language && hljs.getLanguage(language) ? hljs.highlight(source, { language, ignoreIllegals: true }).value : escapeHtml(source);
	return splitHtmlLines(html);
}

// Splits highlighted HTML on newlines, closing and reopening spans that cross a line break.
function splitHtmlLines(html: string): string[] {
	const lines: string[] = [];
	const open: string[] = [];
	let line = "";
	for (const token of html.match(/<span[^>]*>|<\/span>|\n|[^<\n]+/g) ?? []) {
		if (token === "\n") {
			lines.push(line + "</span>".repeat(open.length));
			line = open.join("");
		} else {
			if (token.startsWith("<span")) open.push(token);
			else if (token === "</span>") open.pop();
			line += token;
		}
	}
	lines.push(line);
	return lines;
}

function escapeHtml(text: string) {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
