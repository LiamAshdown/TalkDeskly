"use client";

import { Button } from "@/components/ui/button";
import { X, File, ImageIcon, FileText } from "lucide-react";
import type { FileWithPreview } from "./types";

interface FilePreviewProps {
  files: FileWithPreview[];
  onRemove: (index: number) => void;
}

// File type helpers
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
  if (fileType.includes("pdf")) return <FileText className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
};

const getFileTypeColor = (fileType: string) => {
  if (fileType.startsWith("image/")) return "bg-purple-600";
  if (fileType.includes("pdf")) return "bg-red-600";
  if (fileType.includes("word") || fileType.includes("doc"))
    return "bg-blue-600";
  if (
    fileType.includes("excel") ||
    fileType.includes("sheet") ||
    fileType.includes("csv")
  )
    return "bg-green-600";
  return "bg-gray-600";
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

export default function FilePreview({ files, onRemove }: FilePreviewProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {files.map((file, index) => (
        <div key={index} className="relative group">
          <div
            className={`flex items-center p-2 rounded-lg ${getFileTypeColor(
              file.type
            )} bg-opacity-20 border border-gray-700`}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-md mr-2 ${getFileTypeColor(
                file.type
              )}`}
            >
              {getFileIcon(file.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate max-w-[150px]">
                {file.name}
              </div>
              <div className="text-xs text-gray-400">
                {formatFileSize(file.size)}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-white ml-1"
              onClick={() => onRemove(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Image preview for image files */}
          {file.type.startsWith("image/") && file.preview && (
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10">
              <img
                src={file.preview || "/placeholder.svg"}
                alt={file.name}
                className="max-w-[200px] max-h-[150px] rounded-md border border-gray-700 shadow-lg"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
