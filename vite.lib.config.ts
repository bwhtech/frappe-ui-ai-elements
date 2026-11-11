// The library build: one ES module per source file, with dependencies left external.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { vuePlugin } from "./vite.shared";

const external = [/^vue($|\/)/, /^frappe-ui($|\/)/, /^ai($|\/)/, /^marked($|\/)/, /^dompurify($|\/)/, /^highlight\.js($|\/)/, /^katex($|\/)/, /^pele($|\/)/];

export default defineConfig({
	plugins: [vuePlugin()],
	build: {
		outDir: "dist",
		emptyOutDir: true,
		target: "es2022",
		minify: false,
		lib: { entry: fileURLToPath(new URL("src/index.ts", import.meta.url)), formats: ["es"] },
		rollupOptions: {
			external,
			output: { preserveModules: true, preserveModulesRoot: "src", entryFileNames: "[name].js" },
		},
	},
});
