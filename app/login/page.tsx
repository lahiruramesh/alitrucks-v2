import { LoginForm } from "@/components/auth/login-form";
import { RedirectAuthenticated } from "@/components/redirect-authenticated";

export default function LoginPage() {
	return (
		<RedirectAuthenticated>
			<LoginForm />
		</RedirectAuthenticated>
	);
}
