"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { LoadingOverlay } from "@/components/loading-overlay";
import { useAuth } from "@/contexts/auth-context";

interface ProtectedRouteProps {
	children: React.ReactNode;
	allowedRoles?: string[];
}

export function ProtectedRoute({
	children,
	allowedRoles = [],
}: ProtectedRouteProps) {
	const { user, isLoading } = useAuth();
	const router = useRouter();
	const redirected = useRef(false);

	useEffect(() => {
		// Only run redirect logic once when auth state is determined
		if (!isLoading && !redirected.current) {
			// If no user, redirect to login
			if (!user) {
				redirected.current = true;
				router.replace("/login");
				return;
			}

			// If specific roles are required, check if user has the right role
			if (
				allowedRoles.length > 0 &&
				user.role &&
				!allowedRoles.includes(user.role)
			) {
				redirected.current = true;
				// Redirect based on user's actual role
				const targetPath =
					user.role === "ADMIN"
						? "/admin"
						: user.role === "SELLER"
							? "/seller"
							: "/dashboard";
				router.replace(targetPath);
				return;
			}
		}
	}, [user, isLoading, allowedRoles, router]);

	// Reset redirect flag when user changes (for logout/login scenarios)
	useEffect(() => {
		redirected.current = false;
	}, []);

	// Show loading while checking authentication
	if (isLoading) {
		return <LoadingOverlay message="Checking authentication..." />;
	}

	// If no user, show loading (redirect will happen in useEffect)
	if (!user) {
		return <LoadingOverlay message="Redirecting to login..." />;
	}

	if (
		allowedRoles.length > 0 &&
		user.role &&
		!allowedRoles.includes(user.role)
	) {
		return <LoadingOverlay message="Redirecting..." />;
	}

	return <>{children}</>;
}
