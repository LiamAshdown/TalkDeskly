"use client";

import { cn } from "~/lib/utils";
import {
  FileText,
  FileIcon,
  ImageIcon,
  Video,
  FileAudio,
  Archive,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { FilePreviewModal } from "./file-preview-modal";
import { Button } from "~/components/ui/button";

export interface FileMetadata {
  extension: string;
  filename: string;
  path: string;
  size: number;
  type: "documents" | "images" | "videos" | "audio" | "other";
  timestamp?: string;
}

export interface FilePreviewProps {
  content: string;
  metadata: FileMetadata;
  className?: string;
}

export function FilePreview({
  content,
  metadata,
  className,
}: FilePreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isImage = metadata.type === "images" && !imageError;
  const isPdf = metadata.extension.toLowerCase() === ".pdf";

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = () => {
    switch (metadata.type) {
      case "documents":
        return <FileText className="h-5 w-5 text-orange-400" />;
      case "images":
        return <ImageIcon className="h-5 w-5 text-blue-400" />;
      case "videos":
        return <Video className="h-5 w-5 text-purple-400" />;
      case "audio":
        return <FileAudio className="h-5 w-5 text-green-400" />;
      case "other":
        if (metadata.extension === ".zip" || metadata.extension === ".rar") {
          return <Archive className="h-5 w-5 text-yellow-400" />;
        }
        return <FileIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getFileTypeLabel = () => {
    if (isPdf) return "PDF";
    if (isImage) return metadata.extension.toUpperCase().replace(".", "");

    switch (metadata.type) {
      case "documents":
        return metadata.extension.toUpperCase().replace(".", "");
      case "videos":
        return metadata.extension.toUpperCase().replace(".", "");
      case "audio":
        return metadata.extension.toUpperCase().replace(".", "");
      default:
        return metadata.extension.toUpperCase().replace(".", "");
    }
  };

  function getFileBackgroundColor() {
    switch (metadata.type) {
      case "documents":
        return "bg-orange-500/10";
      case "images":
        return "bg-blue-500/10";
      case "videos":
        return "bg-purple-500/10";
      case "audio":
        return "bg-green-500/10";
      case "other":
        if (metadata.extension === ".zip" || metadata.extension === ".rar") {
          return "bg-yellow-500/10";
        }
        return "bg-gray-500/10";
    }
  }

  return (
    <>
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-border/30 bg-background/5 backdrop-blur-sm",
          className
        )}
      >
        <div className="cursor-pointer" onClick={() => setIsModalOpen(true)}>
          {isImage ? (
            <div className="relative aspect-video overflow-hidden mb-2">
              <img
                src={content || "/placeholder.svg"}
                alt={metadata.filename}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className={`${getFileBackgroundColor()} p-3 m-3 rounded-md`}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-background/20">
                  {getFileIcon()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-medium">
                      {metadata.filename}
                    </h3>
                  </div>
                  {isPdf && (
                    <p className="text-xs text-muted-foreground">Preview PDF</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border/10 px-3 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-background/20 px-1.5 py-0.5 text-xs font-medium">
              {getFileTypeLabel()}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatFileSize(metadata.size)}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={() => setIsModalOpen(true)}
          >
            <ExternalLink className="h-3 w-3" />
            <span className="sr-only">Open</span>
          </Button>
        </div>

        {metadata.timestamp && (
          <div className="border-t border-border/10 px-3 py-1.5 text-xs text-muted-foreground">
            {metadata.timestamp}
          </div>
        )}
      </div>

      <FilePreviewModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        content={content}
        metadata={metadata}
      />
    </>
  );
}
