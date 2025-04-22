"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { FileDown, AlertCircle } from "lucide-react";
import type { FileMetadata } from "./file-preview";

interface FilePreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  metadata: FileMetadata;
}

export function FilePreviewModal({
  isOpen,
  onOpenChange,
  content,
  metadata,
}: FilePreviewModalProps) {
  const [previewError, setPreviewError] = useState(false);

  const canPreview = () => {
    if (previewError) return false;

    if (metadata.type === "images") return true;

    // PDF preview could be added with a PDF viewer library
    // Video and audio preview could be added with native elements
    return false;
  };

  const renderPreview = () => {
    if (!canPreview()) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">Cannot preview this file</h3>
          <p className="text-sm text-muted-foreground">
            This file type cannot be previewed directly.
          </p>
        </div>
      );
    }

    if (metadata.type === "images") {
      return (
        <div className="relative h-[70vh] w-full overflow-hidden">
          <img
            src={content || "/placeholder.svg"}
            alt={metadata.filename}
            className="h-full w-full object-contain"
            onError={() => setPreviewError(true)}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 truncate">
            {metadata.filename}
          </DialogTitle>
        </DialogHeader>

        <div className="my-4">{renderPreview()}</div>

        <DialogFooter>
          <Button variant="outline" asChild>
            <a
              href={content}
              download={metadata.filename}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Download
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
