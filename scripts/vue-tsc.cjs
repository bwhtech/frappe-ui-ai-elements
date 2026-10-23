// vue-tsc needs the TypeScript JS API, which TypeScript 7 (the project's
// `tsc`) no longer ships. Point `typescript` at the 5.x copy frappe-ui
// depends on, then run vue-tsc as usual.
const Module = require("node:module");
const path = require("node:path");

const fromFrappeUI = Module.createRequire(path.join(__dirname, "../node_modules/frappe-ui/package.json"));
const ts5Root = path.dirname(fromFrappeUI.resolve("typescript/package.json"));
const resolve = Module._resolveFilename;

Module._resolveFilename = function (request, ...rest) {
	if (request === "typescript" || request.startsWith("typescript/")) {
		request = ts5Root + request.slice("typescript".length);
	}
	return resolve.call(this, request, ...rest);
};

require("vue-tsc/bin/vue-tsc.js");
