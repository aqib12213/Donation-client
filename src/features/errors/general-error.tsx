import { useNavigate, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
	minimal?: boolean;
};

export function GeneralError({
	className,
	minimal = false,
}: GeneralErrorProps) {
	const navigate = useNavigate();
	const { history } = useRouter();
	return (
		<div className={cn("h-svh w-full", className)}>
			<div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
				{!minimal && (
					<h1 className="font-bold text-[7rem] leading-tight">500</h1>
				)}
				<span className="font-medium">Oops! Something went wrong {`:')`}</span>
				<p className="text-center text-muted-foreground">
					We apologize for the inconvenience. <br /> Please try again later.
				</p>
				{!minimal && (
					<div className="mt-6 flex gap-4">
						<Button onClick={() => history.go(-1)} variant="outline">
							Go Back
						</Button>
						<Button onClick={() => navigate({ to: "/" })}>Back to Home</Button>
					</div>
				)}
			</div>
		</div>
	);
}
