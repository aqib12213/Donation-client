import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./context/theme-provider";

const LIGHT_THEME_COLOR = "oklch(0.985 0 0)";
const DARK_THEME_COLOR = "oklch(0.205 0 0)";

export function ThemeSwitch() {
	const { resolvedTheme, setTheme, theme } = useTheme();

	useEffect(() => {
		const metaThemeColor = document.querySelector("meta[name='theme-color']");
		if (metaThemeColor) {
			const themeColor =
				resolvedTheme === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;
			metaThemeColor.setAttribute("content", themeColor);
		}
	}, [resolvedTheme]);

	const handleThemeToggle = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	return (
		<Button
			className="scale-95 rounded-full"
			onClick={handleThemeToggle}
			size="icon"
			variant="ghost"
		>
			<Sun className="size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
