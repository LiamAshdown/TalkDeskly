import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Download, ZoomIn, ZoomOut, Move, X, FileIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Format file size to human-readable format
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileExtension?: string;
}

export default function FilePreviewModal({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  fileSize,
  fileType,
  fileExtension,
}: FilePreviewModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const isPdf =
    fileExtension?.toLowerCase() === "pdf" ||
    fileName.toLowerCase().endsWith(".pdf");

  const handleDownload = () => {
    if (fileUrl) {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Drag handlers for image
  const handleMouseDown = (e: React.MouseEvent) => {
    if (fileType === "images") {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && fileType === "images") {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    // Add global mouse up handler
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden">
        <div className="relative flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium truncate">{fileName}</h3>
                {fileExtension && (
                  <Badge variant="outline" className="uppercase text-xs">
                    {fileExtension}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize text-xs">
                  {fileType}
                </Badge>
                {fileSize > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(fileSize)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {fileType === "images" && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={zoomOut}
                    disabled={scale <= 0.5}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={zoomIn}
                    disabled={scale >= 3}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetView}
                    title="Reset View"
                  >
                    <Move className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button variant="outline" size="icon" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content Container */}
          <div
            className="relative flex-1 overflow-auto bg-background/80 dark:bg-background/20 p-4"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <div className="flex items-center justify-center min-h-[60vh]">
              {fileType === "images" && (
                <div
                  className={cn(
                    "cursor-grab transition-transform duration-100",
                    isDragging && "cursor-grabbing"
                  )}
                  onMouseDown={handleMouseDown}
                >
                  <img
                    src={fileUrl || "/placeholder.svg"}
                    alt={fileName}
                    className="max-w-full max-h-[70vh] object-contain select-none"
                    style={{
                      transform: `scale(${scale}) translate(${
                        position.x / scale
                      }px, ${position.y / scale}px)`,
                      transformOrigin: "center center",
                    }}
                    draggable="false"
                  />
                </div>
              )}

              {fileType === "videos" && (
                <video
                  src={fileUrl}
                  controls
                  className="max-w-full max-h-[70vh]"
                >
                  Your browser does not support the video tag.
                </video>
              )}

              {fileType === "audio" && (
                <div className="w-full max-w-md p-6 bg-muted rounded-lg">
                  <audio src={fileUrl} controls className="w-full">
                    Your browser does not support the audio tag.
                  </audio>
                </div>
              )}

              {fileType === "documents" && isPdf && (
                <iframe
                  src={`${fileUrl}#toolbar=0&navpanes=0`}
                  className="w-full h-[70vh] border-0"
                  title={fileName}
                >
                  <p>Your browser does not support PDF preview.</p>
                </iframe>
              )}

              {(fileType === "documents" && !isPdf) ||
                (fileType === "other" && (
                  <div className="text-center p-8 bg-muted rounded-lg">
                    <FileIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="mb-4">
                      Preview not available for this file type
                    </p>
                    <Button onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
