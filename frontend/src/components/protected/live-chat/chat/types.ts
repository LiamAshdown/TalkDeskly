export type FileMetadata = {
  filename: string;
  path: string;
  size: number;
  type: string; // "images", "videos", "audio", "documents", or "other"
  extension?: string;
};
