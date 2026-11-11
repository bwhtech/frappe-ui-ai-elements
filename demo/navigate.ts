/**
 * Full-page navigation between the demo's pages (the gallery and the playground are separate
 * Vite entries). `path` is relative to the site root, so the demo also works under a base path,
 * such as /frappe-ui-ai-elements/ on GitHub Pages.
 */
export function navigate(path: string) {
	location.assign(`${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`);
}
