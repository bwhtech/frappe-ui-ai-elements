// Tailwind content globs for this package. Add them to your Tailwind config so the
// classes the components use are generated:
//   import { content as aiElements } from "@bwhtech/frappe-ui-ai-elements/tailwind"
//   content: [...frappeUIContent, ...aiElements, "./src/**/*.{vue,ts}"]
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export const content = [`${root}dist/**/*.js`, `${root}src/**/*.{vue,ts}`];
