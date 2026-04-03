import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn, sleep } from "@/lib/utils";

const formSchema = z.object({
	email: z.email({
		error: (iss) => (iss.input === "" ? "Please enter your email" : undefined),
	}),
});

export function ForgotPasswordForm({
	className,
	...props
}: React.HTMLAttributes<HTMLFormElement>) {
	const navigate = useNavigate();

	const form = useForm({
		defaultValues: { email: "" },
		onSubmit: async ({ value }) => {
			await toast.promise(sleep(2000), {
				loading: "Sending email...",
				success: () => {
					form.reset();
					navigate({ to: "/otp" });
					return `Email sent to ${value.email}`;
				},
				error: "Error",
			});
		},
	});

	const validateEmail = (value: string): string | undefined => {
		const result = formSchema.shape.email.safeParse(value);
		return result.success ? undefined : result.error.issues[0]?.message;
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
			</FieldGroup>

			<Button className="mt-2" disabled={form.state.isSubmitting} type="submit">
				Continue
				{form.state.isSubmitting ? (
					<Loader2 className="animate-spin" />
				) : (
					<ArrowRight />
				)}
			</Button>
		</form>
	);
}
