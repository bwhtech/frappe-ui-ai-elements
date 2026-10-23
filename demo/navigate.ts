/** Full-page navigation between the app's pages (chat, gallery, playground are separate Vite entries). */
export function navigate(path: string) {
	location.assign(path);
}
