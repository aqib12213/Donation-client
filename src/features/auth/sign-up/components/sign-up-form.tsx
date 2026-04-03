import { useForm } from "@tanstack/react-form";
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

const formSchema = z
	.object({
		name: z.string().min(1, "Please enter your name"),
		email: z.email({
			error: (iss) =>
				iss.input === "" ? "Please enter your email" : undefined,
		}),
		password: z
			.string()
			.min(1, "Please enter your password")
			.min(
				MIN_PASSWORD_LENGTH,
				`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
			),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match.",
		path: ["confirmPassword"],
	});

export function SignUpForm({
	className,
	...props
}: React.HTMLAttributes<HTMLFormElement>) {
	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		onSubmit: async () => {
			await Promise.resolve();
			const { toast } = await import("sonner");
			toast.error("Authentication is disabled.");
		},
	});

	const validateName = (value: string): string | undefined => {
		const result = formSchema.shape.name.safeParse(value);
		return result.success ? undefined : result.error.issues[0]?.message;
	};

	const validateEmail = (value: string): string | undefined => {
		const result = formSchema.shape.email.safeParse(value);
		return result.success ? undefined : result.error.issues[0]?.message;
	};

	const validatePassword = (value: string): string | undefined => {
		const result = formSchema.shape.password.safeParse(value);
		return result.success ? undefined : result.error.issues[0]?.message;
	};

	const validateConfirmPassword = (value: string): string | undefined => {
		const result = formSchema.shape.confirmPassword.safeParse(value);
		if (!result.success) {
			return result.error.issues[0]?.message;
		}
		return value === form.state.values.password
			? undefined
			: "Passwords don't match.";
	};

	return (
		<form
			className={cn("grid gap-4", className)}
			onSubmit={async (event) => {
				event.preventDefault();
				event.stopPropagation();
				await form.handleSubmit();
			}}
			{...props}
		>
			<FieldGroup>
				<form.Field
					name="name"
					validators={{
						onBlur: ({ value }) => validateName(value),
						onSubmit: ({ value }) => validateName(value),
					}}
				>
					{(field) => {
						const fieldError = field.state.meta.errors[0];
						const errorMessage =
							typeof fieldError === "string" ? fieldError : undefined;

						return (
							<Field data-invalid={Boolean(errorMessage)}>
								<FieldLabel htmlFor={field.name}>Name</FieldLabel>
								<Input
									aria-invalid={Boolean(errorMessage)}
									autoComplete="name"
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									placeholder="John Doe"
									type="text"
									value={field.state.value}
								/>
								<FieldError>{errorMessage}</FieldError>
							</Field>
						);
					}}
				</form.Field>

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
								<FieldLabel htmlFor={field.name}>Password</FieldLabel>
								<PasswordInput
									aria-invalid={Boolean(errorMessage)}
									autoComplete="new-password"
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									placeholder="********"
									type="password"
									value={field.state.value}
								/>
								<FieldError>{errorMessage}</FieldError>
							</Field>
						);
					}}
				</form.Field>

				<form.Field
					name="confirmPassword"
					validators={{
						onBlur: ({ value }) => validateConfirmPassword(value),
						onSubmit: ({ value }) => validateConfirmPassword(value),
					}}
				>
					{(field) => {
						const fieldError = field.state.meta.errors[0];
						const errorMessage =
							typeof fieldError === "string" ? fieldError : undefined;

						return (
							<Field data-invalid={Boolean(errorMessage)}>
								<FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
								<PasswordInput
									aria-invalid={Boolean(errorMessage)}
									autoComplete="new-password"
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									placeholder="********"
									type="password"
									value={field.state.value}
								/>
								<FieldError>{errorMessage}</FieldError>
							</Field>
						);
					}}
				</form.Field>
			</FieldGroup>

			<Button className="mt-1" disabled={form.state.isSubmitting} type="submit">
				Create Account
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
