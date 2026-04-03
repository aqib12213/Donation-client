import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

const OTP_CODE_LENGTH = 6;
const formSchema = z.object({
	otp: z
		.string()
		.min(OTP_CODE_LENGTH, "Please enter the 6-digit code.")
		.max(OTP_CODE_LENGTH, "Please enter the 6-digit code."),
});

type OtpFormProps = React.HTMLAttributes<HTMLFormElement>;

export function OtpForm({ className, ...props }: OtpFormProps) {
	const form = useForm({
		defaultValues: { otp: "" },
		onSubmit: async () => {
			await Promise.resolve();
		},
	});

	const validateOtp = (value: string): string | undefined => {
		const result = formSchema.shape.otp.safeParse(value);
		return result.success ? undefined : result.error.issues[0]?.message;
	};

	return (
		<form
			className={cn("grid gap-2", className)}
			onSubmit={async (event) => {
				event.preventDefault();
				event.stopPropagation();
				await form.handleSubmit();
			}}
			{...props}
		>
			<FieldGroup>
				<form.Field
					name="otp"
					validators={{
						onBlur: ({ value }) => validateOtp(value),
						onSubmit: ({ value }) => validateOtp(value),
					}}
				>
					{(field) => {
						const fieldError = field.state.meta.errors[0];
						const errorMessage =
							typeof fieldError === "string" ? fieldError : undefined;

						return (
							<Field data-invalid={Boolean(errorMessage)}>
								<FieldLabel className="sr-only" htmlFor={field.name}>
									One-Time Password
								</FieldLabel>
								<InputOTP
									containerClassName='justify-between sm:[&>[data-slot="input-otp-group"]>div]:w-12'
									id={field.name}
									maxLength={OTP_CODE_LENGTH}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(value) => field.handleChange(value)}
									value={field.state.value}
								>
									<InputOTPGroup>
										<InputOTPSlot index={0} />
										<InputOTPSlot index={1} />
									</InputOTPGroup>
									<InputOTPSeparator />
									<InputOTPGroup>
										<InputOTPSlot index={2} />
										<InputOTPSlot index={3} />
									</InputOTPGroup>
									<InputOTPSeparator />
									<InputOTPGroup>
										<InputOTPSlot index={4} />
										<InputOTPSlot index={5} />
									</InputOTPGroup>
								</InputOTP>
								<FieldError>{errorMessage}</FieldError>
							</Field>
						);
					}}
				</form.Field>
			</FieldGroup>
			<Button
				className="mt-2"
				disabled={
					form.state.values.otp.length < OTP_CODE_LENGTH ||
					form.state.isSubmitting
				}
				type="submit"
			>
				Verify
			</Button>
		</form>
	);
}
