import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OnboardingRefreshPage() {
	return (
		<div className="container mx-auto max-w-2xl py-8">
			<Card>
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
						<AlertCircle className="h-6 w-6 text-amber-600" />
					</div>
					<CardTitle className="text-2xl">Setup Interrupted</CardTitle>
				</CardHeader>
				<CardContent className="text-center space-y-6">
					<div className="space-y-2">
						<p className="text-muted-foreground">
							Your bank account setup was interrupted or expired.
						</p>
						<p className="text-muted-foreground">
							Don&apos;t worry - you can restart the process anytime from your
							seller profile.
						</p>
					</div>

					<div className="flex gap-4 justify-center">
						<Button asChild>
							<Link href="/profile">Complete Setup</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link href="/seller">Go to Seller Dashboard</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
