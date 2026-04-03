import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_authenticated")({
	component: RouteComponent,
});

interface LayoutProps {
	children?: React.ReactNode;
}

function RouteComponent({ children }: LayoutProps) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="bg-muted/20">
				{children ?? <Outlet />}
			</SidebarInset>
		</SidebarProvider>
	);
}
