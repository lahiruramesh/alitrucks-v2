import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { type NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || "5", 10);
const UPLOAD_DIRECTORY =
	process.env.UPLOAD_DIRECTORY || "public/uploads/vehicles";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
		}

		// Validate file type
		if (!file.type.startsWith("image/")) {
			return NextResponse.json(
				{ error: "Only image files are allowed" },
				{ status: 400 },
			);
		}

		// Validate file size
		const maxSize = MAX_FILE_SIZE_MB * 1024 * 1024;
		if (file.size > maxSize) {
			return NextResponse.json(
				{ error: `File size must be less than ${MAX_FILE_SIZE_MB}MB` },
				{ status: 400 },
			);
		}

		// Generate unique filename
		const fileExtension = file.name.split(".").pop();
		const fileName = `${randomUUID()}.${fileExtension}`;

		// Create uploads directory if it doesn't exist
		const uploadDir = join(process.cwd(), UPLOAD_DIRECTORY);
		try {
			await mkdir(uploadDir, { recursive: true });
		} catch (_error) {
			// Directory might already exist
		}

		// Save file
		const filePath = join(uploadDir, fileName);
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		await writeFile(filePath, buffer);

		// Return public URL (remove 'public' from path for web access)
		const publicUrl = `/${UPLOAD_DIRECTORY.replace("public/", "")}/${fileName}`;

		return NextResponse.json({
			success: true,
			url: publicUrl,
			filename: fileName,
		});
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
