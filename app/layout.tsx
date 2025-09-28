import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { LocaleProvider } from "@/components/locale-provider";
import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";

export const metadata: Metadata = {
	title: "Ali Trucks - Truck Rental Platform",
	description:
		"Connect truck owners with renters. Rent trucks with confidence.",
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const messages = await getMessages();

	return (
		<html lang="en" suppressHydrationWarning>
			<body className="antialiased">
				<LocaleProvider>
					<NextIntlClientProvider messages={messages}>
						<AuthProvider>{children}</AuthProvider>
					</NextIntlClientProvider>
				</LocaleProvider>
			</body>
		</html>
	);
}
