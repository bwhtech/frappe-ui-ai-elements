const here = new URL(".", import.meta.url).pathname;

export default {
	plugins: {
		tailwindcss: { config: `${here}tailwind.config.js` },
		autoprefixer: {},
	},
};
