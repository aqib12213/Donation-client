import { createRouter, RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { LinguiProvider } from "./components/context/lingui-provider";
import { ThemeProvider } from "./components/context/theme-provider";
import { TooltipProvider } from "./components/ui/tooltip";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	scrollRestoration: true,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<ThemeProvider>
			<TooltipProvider>
				<LinguiProvider>
					{" "}
					{/* // LinguiProvider i18n and Direction provider - wraps entire app to provide locale and direction context */}
					<RouterProvider router={router} />
				</LinguiProvider>
			</TooltipProvider>
		</ThemeProvider>
	);
}
