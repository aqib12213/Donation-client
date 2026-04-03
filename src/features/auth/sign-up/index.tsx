import { Link } from "@tanstack/react-router";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { AuthLayout } from "../auth-layout";
import { SignUpForm } from "./components/sign-up-form";

export function SignUp() {
	return (
		<AuthLayout>
			<Card className="gap-4">
				<CardHeader>
					<CardTitle className="text-lg tracking-tight">
						Create an account
					</CardTitle>
					<CardDescription>
						Enter your email and password to create an account. <br />
						Already have an account?{" "}
						<Link
							className="underline underline-offset-4 hover:text-primary"
							to="/sign-in"
						>
							Sign In
						</Link>
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SignUpForm />
				</CardContent>
				<CardFooter>
					<p className="px-8 text-center text-muted-foreground text-sm">
						By creating an account, you agree to our{" "}
						<a
							className="underline underline-offset-4 hover:text-primary"
							href="/terms"
						>
							Terms of Service
						</a>{" "}
						and{" "}
						<a
							className="underline underline-offset-4 hover:text-primary"
							href="/privacy"
						>
							Privacy Policy
						</a>
						.
					</p>
				</CardFooter>
			</Card>
		</AuthLayout>
	);
}
