import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OnboardingSuccessPage() {
	return (
		<div className="container mx-auto max-w-2xl py-8">
			<Card>
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
						<CheckCircle className="h-6 w-6 text-green-600" />
					</div>
					<CardTitle className="text-2xl">
						Bank Account Connected Successfully!
					</CardTitle>
				</CardHeader>
				<CardContent className="text-center space-y-6">
					<div className="space-y-2">
						<p className="text-muted-foreground">
							Your bank account has been successfully connected to your seller
							account.
						</p>
						<p className="text-muted-foreground">
							You can now publish vehicles and receive payments directly to your
							bank account.
						</p>
					</div>

					<div className="flex gap-4 justify-center">
						<Button asChild>
							<Link href="/seller/vehicles/new">
								Publish Your First Vehicle
							</Link>
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
