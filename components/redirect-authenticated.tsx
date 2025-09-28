"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingOverlay } from "@/components/loading-overlay";
import { useAuth } from "@/contexts/auth-context";

interface RedirectAuthenticatedProps {
	children: React.ReactNode;
}

export function RedirectAuthenticated({
	children,
}: RedirectAuthenticatedProps) {
	const { user, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && user) {
			// Redirect authenticated users based on their role
			switch (user.role) {
				case "ADMIN":
					router.push("/admin");
					break;
				case "SELLER":
					router.push("/seller");
					break;
				default:
					router.push("/dashboard");
					break;
			}
		}
	}, [user, isLoading, router]);

	// Show loading while checking authentication
	if (isLoading) {
		return <LoadingOverlay message="Loading..." />;
	}

	// If user is authenticated, don't render the page (redirect will happen)
	if (user) {
		return <LoadingOverlay message="Redirecting to dashboard..." />;
	}

	// User is not authenticated, show the page
	return <>{children}</>;
}
