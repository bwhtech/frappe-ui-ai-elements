import vue from "@vitejs/plugin-vue";
import { createRequire } from "node:module";
import * as compiler from "vue/compiler-sfc";

// frappe-ui ships .vue sources whose props import types from other files. The SFC
// compiler resolves those with the TypeScript JS API, which TypeScript 7 no longer
// has, so hand it the 5.x copy frappe-ui depends on.
const fromFrappeUI = createRequire(new URL("node_modules/frappe-ui/package.json", import.meta.url));
compiler.registerTS(() => fromFrappeUI("typescript"));

export const vuePlugin = () => vue({ compiler });
