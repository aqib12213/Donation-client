import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { IconFacebook, IconGithub } from "@/assets/brand-icons";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MIN_PASSWORD_LENGTH = 7;

const formSchema = z.object({
	email: z.email({
		error: (iss) => (iss.input === "" ? "Please enter your email" : undefined),
	}),
	password: z
		.string()
		.min(1, "Please enter your password")
		.min(
			MIN_PASSWORD_LENGTH,
			`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
		),
});

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
	redirectTo?: string;
}

export function UserAuthForm({
	className,
	redirectTo,
	...props
}: UserAuthFormProps) {
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async () => {
			await Promise.resolve();
			toast.error("Authentication is disabled.");
		},
	});

	const validateEmail = (value: string): string | undefined => {
		const result = formSchema.shape.email.safeParse(value);
		return result.success ? undefined : result.error.issues[0]?.message;
	};

	const validatePassword = (value: string): string | undefined => {
		const result = formSchema.shape.password.safeParse(value);
		return result.success ? undefined : result.error.issues[0]?.message;
	};

	return (
		<form
			className={cn("grid gap-4", className)}
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
			}}
			{...props}
		>
			<FieldGroup>
				<form.Field
					name="email"
					validators={{
						onBlur: ({ value }) => validateEmail(value),
						onSubmit: ({ value }) => validateEmail(value),
					}}
				>
					{(field) => {
						const fieldError = field.state.meta.errors[0];
						const errorMessage =
							typeof fieldError === "string" ? fieldError : undefined;

						return (
							<Field data-invalid={Boolean(errorMessage)}>
								<FieldLabel htmlFor={field.name}>Email</FieldLabel>
								<Input
									aria-invalid={Boolean(errorMessage)}
									autoComplete="email"
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									placeholder="name@example.com"
									type="email"
									value={field.state.value}
								/>
								<FieldError>{errorMessage}</FieldError>
							</Field>
						);
					}}
				</form.Field>

				<form.Field
					name="password"
					validators={{
						onBlur: ({ value }) => validatePassword(value),
						onSubmit: ({ value }) => validatePassword(value),
					}}
				>
					{(field) => {
						const fieldError = field.state.meta.errors[0];
						const errorMessage =
							typeof fieldError === "string" ? fieldError : undefined;

						return (
							<Field data-invalid={Boolean(errorMessage)}>
								<div className="flex items-center justify-between gap-2">
									<FieldLabel htmlFor={field.name}>Password</FieldLabel>
									<Link
										className="font-medium text-muted-foreground text-sm hover:opacity-75"
										to="/forgot-password"
									>
										Forgot password?
									</Link>
								</div>
								<PasswordInput
									aria-invalid={Boolean(errorMessage)}
									autoComplete="current-password"
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									placeholder="********"
									value={field.state.value}
								/>
								<FieldError>{errorMessage}</FieldError>
							</Field>
						);
					}}
				</form.Field>
			</FieldGroup>

			<Button className="mt-1" disabled={form.state.isSubmitting} type="submit">
				{form.state.isSubmitting ? (
					<Loader2 className="animate-spin" />
				) : (
					<LogIn />
				)}
				Sign in
			</Button>

			<FieldSeparator>Or continue with</FieldSeparator>

			<div className="grid grid-cols-2 gap-2">
				<Button
					className="w-full"
					disabled={form.state.isSubmitting}
					type="button"
					variant="outline"
				>
					<IconGithub className="h-4 w-4" /> GitHub
				</Button>
				<Button
					className="w-full"
					disabled={form.state.isSubmitting}
					type="button"
					variant="outline"
				>
					<IconFacebook className="h-4 w-4" /> Facebook
				</Button>
			</div>
		</form>
	);
}
