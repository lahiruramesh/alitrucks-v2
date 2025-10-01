"use client";

import { AlertCircle, Image as ImageIcon, Plus, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PhotoUploadWizardProps {
	images: string[];
	onImagesChange: (images: string[]) => void;
	maxPhotos?: number;
	maxFileSize?: number; // in MB
}

interface UploadState {
	isUploading: boolean;
	progress: number;
	error?: string;
}

const DEFAULT_MAX_PHOTOS = parseInt(
	process.env.NEXT_PUBLIC_MAX_PHOTOS_PER_VEHICLE || "10",
	10,
);
const DEFAULT_MAX_FILE_SIZE = parseInt(
	process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "5",
	10,
);

export function PhotoUploadWizard({
	images,
	onImagesChange,
	maxPhotos = DEFAULT_MAX_PHOTOS,
	maxFileSize = DEFAULT_MAX_FILE_SIZE,
}: PhotoUploadWizardProps) {
	const [uploadState, setUploadState] = useState<UploadState>({
		isUploading: false,
		progress: 0,
	});
	const [dragActive, setDragActive] = useState(false);

	const handleFileUpload = useCallback(
		async (files: FileList) => {
			if (images.length >= maxPhotos) {
				setUploadState({
					isUploading: false,
					progress: 0,
					error: `Maximum ${maxPhotos} photos allowed`,
				});
				return;
			}

			const validFiles: File[] = [];
			const errors: string[] = [];

			Array.from(files).forEach((file) => {
				if (!file.type.startsWith("image/")) {
					errors.push(`${file.name} is not an image`);
					return;
				}

				if (file.size > maxFileSize * 1024 * 1024) {
					errors.push(`${file.name} is too large (max ${maxFileSize}MB)`);
					return;
				}

				if (images.length + validFiles.length >= maxPhotos) {
					errors.push(`Maximum ${maxPhotos} photos allowed`);
					return;
				}

				validFiles.push(file);
			});

			if (errors.length > 0) {
				setUploadState({
					isUploading: false,
					progress: 0,
					error: errors.join(", "),
				});
				return;
			}

			if (validFiles.length === 0) return;

			setUploadState({ isUploading: true, progress: 0 });

			try {
				const uploadedImages: string[] = [];

				for (let i = 0; i < validFiles.length; i++) {
					const file = validFiles[i];
					const formData = new FormData();
					formData.append("file", file);

					const response = await fetch("/api/upload", {
						method: "POST",
						body: formData,
					});

					if (!response.ok) {
						throw new Error(`Failed to upload ${file.name}`);
					}

					const result = await response.json();
					uploadedImages.push(result.url);

					setUploadState({
						isUploading: true,
						progress: ((i + 1) / validFiles.length) * 100,
					});
				}

				onImagesChange([...images, ...uploadedImages]);
				setUploadState({ isUploading: false, progress: 100 });

				// Clear progress after a delay
				setTimeout(() => {
					setUploadState({ isUploading: false, progress: 0 });
				}, 1500);
			} catch (error) {
				setUploadState({
					isUploading: false,
					progress: 0,
					error: error instanceof Error ? error.message : "Upload failed",
				});
			}
		},
		[images, onImagesChange, maxPhotos, maxFileSize],
	);

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setDragActive(false);

			if (e.dataTransfer.files?.[0]) {
				handleFileUpload(e.dataTransfer.files);
			}
		},
		[handleFileUpload],
	);

	const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(true);
	}, []);

	const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(true);
	}, []);

	const removeImage = useCallback(
		(index: number) => {
			const newImages = images.filter((_, i) => i !== index);
			onImagesChange(newImages);
		},
		[images, onImagesChange],
	);

	const reorderImages = useCallback(
		(fromIndex: number, toIndex: number) => {
			const newImages = [...images];
			const [movedImage] = newImages.splice(fromIndex, 1);
			newImages.splice(toIndex, 0, movedImage);
			onImagesChange(newImages);
		},
		[images, onImagesChange],
	);

	const clearError = useCallback(() => {
		setUploadState((prev) => ({ ...prev, error: undefined }));
	}, []);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<ImageIcon className="h-5 w-5" />
					Vehicle Photos
					<span className="text-sm font-normal text-muted-foreground">
						({images.length}/{maxPhotos})
					</span>
				</CardTitle>
				<CardDescription>
					Upload up to {maxPhotos} high-quality photos of your vehicle. The
					first photo will be used as the main listing image.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Upload Area */}
				{images.length < maxPhotos && (
					<section
						aria-label="Image upload area"
						className={cn(
							"relative border-2 border-dashed rounded-lg p-6 md:p-8 transition-colors",
							dragActive
								? "border-primary bg-primary/5"
								: "border-muted-foreground/25 hover:border-muted-foreground/50",
							uploadState.isUploading && "pointer-events-none opacity-50",
						)}
						onDrop={handleDrop}
						onDragOver={handleDragOver}
						onDragEnter={handleDragEnter}
						onDragLeave={handleDragLeave}
					>
						<div className="flex flex-col items-center justify-center space-y-4 text-center">
							<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
								<Upload className="h-6 w-6 text-muted-foreground" />
							</div>
							<div className="space-y-2">
								<h3 className="text-lg font-medium">
									Drop photos here, or click to browse
								</h3>
								<p className="text-sm text-muted-foreground">
									PNG, JPG up to {maxFileSize}MB each
								</p>
							</div>
							<div className="flex flex-col sm:flex-row gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										const input = document.createElement("input");
										input.type = "file";
										input.multiple = true;
										input.accept = "image/*";
										input.onchange = (e) => {
											const target = e.target as HTMLInputElement;
											if (target.files) {
												handleFileUpload(target.files);
											}
										};
										input.click();
									}}
									disabled={uploadState.isUploading}
								>
									<Plus className="h-4 w-4 mr-2" />
									Choose Files
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										// Simulate camera access for mobile
										const input = document.createElement("input");
										input.type = "file";
										input.accept = "image/*";
										input.capture = "environment";
										input.onchange = (e) => {
											const target = e.target as HTMLInputElement;
											if (target.files) {
												handleFileUpload(target.files);
											}
										};
										input.click();
									}}
									disabled={uploadState.isUploading}
									className="md:hidden"
								>
									📷 Take Photo
								</Button>
							</div>
						</div>
					</section>
				)}

				{/* Upload Progress */}
				{uploadState.isUploading && (
					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span>Uploading photos...</span>
							<span>{Math.round(uploadState.progress)}%</span>
						</div>
						<Progress value={uploadState.progress} className="h-2" />
					</div>
				)}

				{/* Error Display */}
				{uploadState.error && (
					<div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
						<AlertCircle className="h-4 w-4 text-destructive" />
						<span className="text-sm text-destructive flex-1">
							{uploadState.error}
						</span>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={clearError}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				)}

				{/* Photo Grid */}
				{images.length > 0 && (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h4 className="text-sm font-medium">
								Uploaded Photos ({images.length})
							</h4>
							{images.length > 1 && (
								<p className="text-xs text-muted-foreground">
									Drag to reorder • First photo is the main image
								</p>
							)}
						</div>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{images.map((imageUrl, index) => (
								<div
									key={imageUrl || `upload-${index}`}
									role="img"
									aria-label={`Image ${index + 1}, drag to reorder`}
									className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
									draggable
									onDragStart={(e) => {
										e.dataTransfer.setData("text/plain", index.toString());
									}}
									onDragOver={(e) => e.preventDefault()}
									onDrop={(e) => {
										e.preventDefault();
										const fromIndex = parseInt(
											e.dataTransfer.getData("text/plain"),
											10,
										);
										if (fromIndex !== index) {
											reorderImages(fromIndex, index);
										}
									}}
								>
									<Image
										src={imageUrl}
										alt={`Vehicle photo ${index + 1}`}
										fill
										className="object-cover transition-transform group-hover:scale-105"
										sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
									/>
									{index === 0 && (
										<div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
											Main
										</div>
									)}
									<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
									<Button
										type="button"
										variant="destructive"
										size="sm"
										className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
										onClick={() => removeImage(index)}
									>
										<X className="h-3 w-3" />
									</Button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Helpful Tips */}
				<div className="rounded-lg bg-muted/50 p-4 space-y-2">
					<h5 className="text-sm font-medium">📸 Photo Tips</h5>
					<ul className="text-xs text-muted-foreground space-y-1">
						<li>• Take photos in good lighting, preferably outdoors</li>
						<li>• Include exterior, interior, engine, and any damage</li>
						<li>• Clean the vehicle before photographing</li>
						<li>• The first photo will be used as the main listing image</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}
