"use client";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          aria-label="Insert emoji"
        >
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-full p-0 border-none shadow-lg"
        sideOffset={10}
      >
        <div className="emoji-picker-container">
          <Picker
            data={data}
            onEmojiSelect={(emoji: any) => onEmojiSelect(emoji.native)}
            theme="dark"
            previewPosition="none"
            skinTonePosition="none"
            set="native"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
