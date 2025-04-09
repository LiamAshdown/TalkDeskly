import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, ImageIcon } from "lucide-react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ASPECT_RATIOS = {
  "1:1": { width: 1, height: 1, label: "Square (1:1)" },
  "4:3": { width: 4, height: 3, label: "Standard (4:3)" },
  "16:9": { width: 16, height: 9, label: "Widescreen (16:9)" },
  "3:4": { width: 3, height: 4, label: "Portrait (3:4)" },
  "9:16": { width: 9, height: 16, label: "Mobile (9:16)" },
  free: { width: 0, height: 0, label: "Free" },
} as const;

export function UploadAvatarDialog({
  onUpload,
  className,
  width = 300,
  height = 300,
  maxSize = 10, // Default max size in MB
  aspectRatio = "4:3",
}: {
  onUpload: (file: File) => void;
  className?: string;
  width?: number;
  height?: number;
  maxSize?: number;
  aspectRatio?: keyof typeof ASPECT_RATIOS;
}) {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxFiles: 1,
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    onDrop: (acceptedFiles, rejectedFiles) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          setError(`File is too large. Maximum size is ${maxSize}MB`);
          return;
        }
        if (rejection.errors[0]?.code === "file-invalid-type") {
          setError("Invalid file type. Please upload an image file.");
          return;
        }
      }

      const file = acceptedFiles[0];
      if (file) {
        setOriginalFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImage(e.target?.result as string);
          setCroppedImage(null);
          setActiveTab("edit");
        };
        reader.readAsDataURL(file);
      }
    },
  });

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleReset = () => {
    setImage(null);
    setCroppedImage(null);
    setZoom(1);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
    setActiveTab("upload");
    setOriginalFile(null);
  };

  const createCroppedImage = useCallback(async () => {
    if (!image || !croppedAreaPixels || !originalFile) return;

    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = image;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(-img.width / 2, -img.height / 2);
    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      0,
      0,
      img.width,
      img.height
    );

    const croppedImageUrl = canvas.toDataURL("image/jpeg");
    setCroppedImage(croppedImageUrl);
    setActiveTab("preview");
  }, [image, croppedAreaPixels, rotation, zoom, originalFile]);

  const getCroppedFile = useCallback(async (): Promise<File | null> => {
    if (!croppedImage || !originalFile) return null;

    const response = await fetch(croppedImage);
    const blob = await response.blob();
    return new File([blob], originalFile.name, { type: blob.type });
  }, [croppedImage, originalFile]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn("w-full", className)} size="sm" variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Upload Picture
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload and edit image</DialogTitle>
          <DialogDescription>
            Upload, crop, and resize your image
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="edit" disabled={!image}>
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!croppedImage}>
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <div
              {...getRootProps()}
              className={cn(
                "flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center",
                isDragActive
                  ? "border-primary bg-primary/10"
                  : "border-muted-foreground/25"
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-2">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </div>
                <div className="text-xs text-muted-foreground">
                  JPG, PNG, GIF (max {maxSize}MB)
                </div>
                {error && (
                  <div className="text-sm text-destructive">{error}</div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="edit" className="mt-4">
            {image && (
              <div className="space-y-4">
                <div className="relative h-[300px] w-full overflow-hidden rounded-md border">
                  <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={
                      ASPECT_RATIOS[aspectRatio].width === 0
                        ? undefined
                        : ASPECT_RATIOS[aspectRatio].width /
                          ASPECT_RATIOS[aspectRatio].height
                    }
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Zoom</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(zoom * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[zoom * 100]}
                      min={100}
                      max={300}
                      step={1}
                      onValueChange={(value) => setZoom(value[0] / 100)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Rotation</span>
                      <span className="text-sm text-muted-foreground">
                        {rotation}°
                      </span>
                    </div>
                    <Slider
                      value={[rotation]}
                      min={0}
                      max={360}
                      step={1}
                      onValueChange={(value) => setRotation(value[0])}
                    />
                  </div>

                  <Button className="w-full" onClick={createCroppedImage}>
                    Crop Image
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            {croppedImage && (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-md border">
                  <div className="flex items-center justify-center p-2">
                    <img
                      src={croppedImage || "/placeholder.svg"}
                      alt="Cropped Preview"
                      className="max-h-[300px] rounded-md object-contain"
                      style={{ width: `${width}px`, height: `${height}px` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button
            type="button"
            disabled={!croppedImage || !originalFile}
            onClick={async () => {
              const croppedFile = await getCroppedFile();
              if (croppedFile) {
                onUpload(croppedFile);
                setOpen(false);

                handleReset();
              }
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
