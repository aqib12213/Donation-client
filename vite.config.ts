import { lingui } from "@lingui/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
// Constants to satisfy lint rules

const config = defineConfig({
	// optimizeDeps: {
	// 	exclude: ["sqlocal"],
	// },
	// assetsInclude: ["**/*.sqlite", "**/*.wasm"],
	plugins: [
		// sqlocal(),
		lingui(),
		devtools(),
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		tailwindcss(),
		tanstackRouter({ target: "react", autoCodeSplitting: true }),
		viteReact({
			babel: {
				plugins: [
					"babel-plugin-react-compiler",
					"@lingui/babel-plugin-lingui-macro",
				],
			},
		}),
		VitePWA({
			registerType: "prompt",
			injectRegister: "auto",

			pwaAssets: {
				disabled: false,
				config: true,
			},

			manifest: {
				name: "PWA-APP",
				short_name: "PWA-APP",
				description:
					"PWA-APP is an offline-first invoicing and ledger management application designed specifically for SMEs in South Asia",
				theme_color: "#fafafa",
			},

			workbox: {
				globPatterns: ["**/*.{js,css,html,svg,png,ico,wasm,data,sql,po}"],
				cleanupOutdatedCaches: true,
				clientsClaim: true,
				sourcemap: true,

				runtimeCaching: [
					// {
					// 	urlPattern: WASM_REGEX,
					// 	handler: "CacheFirst",
					// 	options: {
					// 		cacheName: "wasm-cache",
					// 	},
					// },
					// {
					// 	urlPattern: DATA_SQL_REGEX,
					// 	handler: "CacheFirst",
					// 	options: {
					// 		cacheName: "pglite-data-cache",
					// 	},
					// },
				],
			},

			devOptions: {
				enabled: true,
				navigateFallback: "index.html",
				suppressWarnings: true,
				type: "module",
			},
		}),
	],
	build: {
		commonjsOptions: {
			transformMixedEsModules: true,
		},
	},
});

export default config;
