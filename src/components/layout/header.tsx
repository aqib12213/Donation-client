import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
	ref?: React.Ref<HTMLElement>;
};

export function Header({ className, children, ...props }: HeaderProps) {
	return (
		<header className={cn("z-50 h-12", className)} {...props}>
			<div
				className={cn(
					"relative flex h-full items-center gap-3 p-4 sm:gap-4",
					"after:absolute after:inset-0 after:-z-10 after:bg-background/20 after:backdrop-blur-lg"
				)}
			>
				<SidebarTrigger className="max-md:scale-125" variant="outline" />
				<Separator className="h-6" orientation="vertical" />
				{children}
			</div>
		</header>
	);
}
