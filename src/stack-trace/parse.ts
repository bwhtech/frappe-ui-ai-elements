export interface StackFrame {
	raw: string;
	fn?: string;
	file?: string;
	line?: number;
	column?: number;
	/** Library code (node_modules, frappe, site-packages): shown muted. */
	external: boolean;
}

const EXTERNAL = /node_modules|site-packages|\/frappe\/frappe\/|internal\//;
// "at fn (file:line:col)", "at file:line:col", or Python's 'File "x.py", line 12, in fn'.
const JS_FRAME = /^at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?$/;
const PY_FRAME = /^File "(.+?)", line (\d+)(?:, in (.+))?$/;

/** Splits a stack into the error line and its frames. Handles JS and Python traces. */
export function parseStack(stack: string) {
	const lines = stack.split("\n").map((line) => line.trim()).filter(Boolean);
	const python = lines[0]?.startsWith("Traceback");
	const error = (python ? lines[lines.length - 1] : lines[0]) ?? "";
	const frameLines = python ? lines.slice(1, -1).filter((line) => line.startsWith("File ")) : lines.slice(1);
	return { error, frames: frameLines.map(parseFrame) };
}

function parseFrame(raw: string): StackFrame {
	const js = raw.match(JS_FRAME);
	if (js) return { raw, fn: js[1], file: js[2], line: +js[3], column: +js[4], external: EXTERNAL.test(js[2]) };
	const py = raw.match(PY_FRAME);
	if (py) return { raw, fn: py[3], file: py[1], line: +py[2], external: EXTERNAL.test(py[1]) };
	return { raw, external: EXTERNAL.test(raw) };
}
