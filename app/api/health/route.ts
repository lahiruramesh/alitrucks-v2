import { NextResponse } from "next/server";

export async function GET() {
	try {
		// Simple health check
		return NextResponse.json(
			{
				status: "healthy",
				timestamp: new Date().toISOString(),
				uptime: process.uptime(),
				environment: process.env.NODE_ENV || "development",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Health check error:", error);
		return NextResponse.json(
			{
				status: "unhealthy",
				error: "Health check failed",
				timestamp: new Date().toISOString(),
			},
			{ status: 500 },
		);
	}
}
