export interface FileWithPreview extends File {
  preview?: string;
}

export interface Agent {
  id: number;
  name: string;
  avatar: string;
  status: "online" | "away" | "offline";
}
