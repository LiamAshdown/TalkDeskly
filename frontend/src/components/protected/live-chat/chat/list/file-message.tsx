import { useState } from "react";
import { cn } from "@/lib/utils";
import { File, FileText, ImageIcon, Package, Music, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import FilePreviewModal, { formatFileSize } from "./file-preview-modal";

export type FileMetadata = {
  filename: string;
  path: string;
  size: number;
  type: string; // "images", "videos", "audio", "documents", or "other"
  extension?: string;
};

interface FileMessageProps {
  content: string;
  metadata?: FileMetadata;
}

export default function FileMessage({ content, metadata }: FileMessageProps) {
  const fileType = metadata?.type || "other";
  const fileUrl = metadata?.path || "";
  const fileSize = metadata?.size || 0;
  const fileExtension = metadata?.extension || "";
  const [previewOpen, setPreviewOpen] = useState(false);
  const isPdf =
    fileExtension?.toLowerCase() === "pdf" ||
    metadata?.filename?.toLowerCase().endsWith(".pdf");

  // Helper function to get appropriate icon based on file type
  const getFileIcon = () => {
    switch (fileType) {
      case "images":
        return <ImageIcon className="h-5 w-5" />;
      case "videos":
        return <Video className="h-5 w-5" />;
      case "audio":
        return <Music className="h-5 w-5" />;
      case "documents":
        return <FileText className="h-5 w-5" />;
      case "other":
        return fileExtension?.toLowerCase() === "zip" ||
          fileExtension?.toLowerCase() === "rar" ? (
          <Package className="h-5 w-5" />
        ) : (
          <File className="h-5 w-5" />
        );
    }
  };

  // Get background color based on file type
  const getIconBackground = () => {
    switch (fileType) {
      case "images":
        return "bg-green-100 dark:bg-green-900/20";
      case "videos":
        return "bg-purple-100 dark:bg-purple-900/20";
      case "audio":
        return "bg-blue-100 dark:bg-blue-900/20";
      case "documents":
        return "bg-red-100 dark:bg-red-900/20";
      case "other":
        return "bg-gray-100 dark:bg-gray-800/40";
    }
  };

  // Get icon color based on file type
  const getIconColor = () => {
    switch (fileType) {
      case "images":
        return "text-green-600 dark:text-green-400";
      case "videos":
        return "text-purple-600 dark:text-purple-400";
      case "audio":
        return "text-blue-600 dark:text-blue-400";
      case "documents":
        return "text-red-600 dark:text-red-400";
      case "other":
        return "text-gray-600 dark:text-gray-400";
    }
  };

  // Handle file preview
  const handleFileClick = () => {
    setPreviewOpen(true);
  };

  // Render image thumbnail
  if (fileType === "images" && fileUrl) {
    return (
      <div className="space-y-2">
        <div
          className="overflow-hidden rounded-md border bg-background cursor-pointer hover:opacity-90 transition-opacity"
          onClick={handleFileClick}
        >
          <img
            src={fileUrl || "/placeholder.svg"}
            alt={metadata?.filename || "Image"}
            className="max-w-full max-h-[300px] object-contain mx-auto"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <p className="truncate">{metadata?.filename || content}</p>
            {fileExtension && (
              <Badge
                variant="outline"
                className="uppercase text-[9px] px-1 py-0"
              >
                {fileExtension}
              </Badge>
            )}
          </div>
          {fileSize > 0 && <span>{formatFileSize(fileSize)}</span>}
        </div>

        {/* File Preview Modal */}
        <FilePreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          fileUrl={fileUrl}
          fileName={metadata?.filename || content}
          fileSize={fileSize}
          fileType={fileType}
          fileExtension={fileExtension}
        />
      </div>
    );
  }

  // For all other file types
  return (
    <div className="space-y-2">
      <Card
        className="overflow-hidden p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/90 transition-colors"
        onClick={handleFileClick}
      >
        <div className={cn("p-2 rounded-md", getIconBackground())}>
          <span className={getIconColor()}>{getFileIcon()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-sm truncate">
              {metadata?.filename || content}
            </p>
            {fileExtension && (
              <Badge
                variant="outline"
                className="uppercase text-[9px] px-1 py-0"
              >
                {fileExtension}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-primary hover:underline">
              {fileType === "videos" && "Preview Video"}
              {fileType === "audio" && "Play Audio"}
              {fileType === "documents" && isPdf && "Preview PDF"}
              {fileType === "documents" && !isPdf && "View Document"}
              {fileType === "other" && "Download File"}
            </span>
            {fileSize > 0 && (
              <span className="text-xs text-muted-foreground">
                {formatFileSize(fileSize)}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fileUrl={fileUrl}
        fileName={metadata?.filename || content}
        fileSize={fileSize}
        fileType={fileType}
        fileExtension={fileExtension}
      />
    </div>
  );
}
