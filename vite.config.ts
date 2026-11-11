// The demo app: the gallery (index.html) and the playground.
import frappeui from "frappe-ui/vite";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { vuePlugin } from "./vite.shared";

const here = fileURLToPath(new URL(".", import.meta.url));
const path = (to: string) => fileURLToPath(new URL(to, import.meta.url));

// The demo imports the package by name. By default that is the source; with
// DEMO_FROM_DIST=1 it is the built package, to check `dist/` works for an app.
const fromSource = [{ find: /^frappe-ui-ai-elements/, replacement: path("src") }];
const fromDist = [
	{ find: /^frappe-ui-ai-elements\/styles\.css$/, replacement: path("src/styles.css") },
	{ find: /^frappe-ui-ai-elements$/, replacement: path("dist/index.js") },
];

export default defineConfig({
	root: "demo",
	// GitHub Pages serves the demo under /<repo>/; the Pages workflow sets DEMO_BASE.
	base: process.env.DEMO_BASE ?? "/",
	plugins: [frappeui({ frappeProxy: false, jinjaBootData: false, buildConfig: false }), vuePlugin()],
	css: { postcss: here },
	resolve: { alias: process.env.DEMO_FROM_DIST ? fromDist : fromSource },
	build: {
		outDir: "../demo-dist",
		emptyOutDir: true,
		target: "es2022",
		rollupOptions: {
			input: {
				gallery: fileURLToPath(new URL("demo/index.html", import.meta.url)),
				playground: fileURLToPath(new URL("demo/playground.html", import.meta.url)),
			},
		},
	},
});
