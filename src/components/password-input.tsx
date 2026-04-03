import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";

type PasswordInputProps = Omit<
	React.InputHTMLAttributes<HTMLInputElement>,
	"type"
> & {
	ref?: React.Ref<HTMLInputElement>;
};

export function PasswordInput({
	className,
	disabled,
	ref,
	...props
}: PasswordInputProps) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<div className={cn("relative rounded-md", className)}>
			<Input
				disabled={disabled}
				ref={ref}
				type={showPassword ? "text" : "password"}
				{...props}
			/>
			<button
				className="absolute inset-e-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-md text-muted-foreground"
				disabled={disabled}
				onClick={() => setShowPassword((prev) => !prev)}
				// size="icon"
				type="button"
				// variant="ghost"
			>
				{showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
			</button>
		</div>
	);
}
