import { Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { locales } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useLingui } from "./context/lingui-provider";

export function LanguageSwitch() {
	const { locale, setLocale } = useLingui();

	const localeEntries = Object.entries(locales) as [
		keyof typeof locales,
		string,
	][];

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger
				render={
					<Button className="scale-95 rounded-full" size="icon" variant="ghost">
						<Globe className="size-5" />
						<span className="sr-only">Toggle language</span>
					</Button>
				}
			/>
			<DropdownMenuContent align="end">
				{localeEntries.map(([localeKey, localeLabel]) => (
					<DropdownMenuItem
						key={localeKey}
						onClick={() => setLocale(localeKey)}
					>
						{localeLabel}
						<Check
							className={cn("ms-auto", locale !== localeKey && "hidden")}
							size={14}
						/>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
