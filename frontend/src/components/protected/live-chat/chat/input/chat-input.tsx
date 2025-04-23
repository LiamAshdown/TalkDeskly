"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Smile, Send } from "lucide-react";
import type { FileWithPreview } from "@/components/protected/live-chat/chat/input/types";
import FilePreview from "@/components/protected/live-chat/chat/input/file-preview";
import MentionsDropdown from "@/components/protected/live-chat/chat/input/mentions-dropdown";
import { Agent } from "@/lib/interfaces";
import EmojiPicker from "@/components/protected/emoji-picker";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string, files: File[]) => void;
  disabled?: boolean;
  placeholder: string;
  buttonText: string;
  buttonColor: string;
  borderColor?: string;
  agents: Agent[];
}

export default function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder,
  buttonText,
  buttonColor,
  borderColor,
  agents,
}: ChatInputProps) {
  // Internal state
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle text input changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart || 0;

    setMessage(value);
    setCursorPosition(position);

    // Only check for mentions if we have agents
    if (agents.length > 0) {
      // Check if we should show the mentions dropdown
      const textBeforeCursor = value.substring(0, position);
      const atSignIndex = textBeforeCursor.lastIndexOf("@");

      if (
        atSignIndex !== -1 &&
        (atSignIndex === 0 || textBeforeCursor[atSignIndex - 1] === " ")
      ) {
        // Check if we're still typing the mention (no space after @ or cursor is right after @)
        const textFromAtToEnd = value.substring(atSignIndex);
        const nextSpaceIndex = textFromAtToEnd.indexOf(" ");

        // If there's no space after @ or cursor is before that space, it's an active mention
        if (nextSpaceIndex === -1 || position <= atSignIndex + nextSpaceIndex) {
          const filterText = textBeforeCursor.substring(atSignIndex + 1);
          setMentionFilter(filterText);
          setShowMentions(true);
        } else {
          setShowMentions(false);
        }
      } else {
        setShowMentions(false);
      }
    }
  };

  // Handle selecting an agent from the mentions dropdown
  const handleSelectAgent = (agent: Agent) => {
    if (textareaRef.current) {
      const textBeforeCursor = message.substring(0, cursorPosition);
      const atSignIndex = textBeforeCursor.lastIndexOf("@");
      const textAfterCursor = message.substring(cursorPosition);

      // Replace the @mention text with the agent's name
      const newText =
        textBeforeCursor.substring(0, atSignIndex) +
        `@${agent.name} ` +
        textAfterCursor;

      setMessage(newText);
      setShowMentions(false);

      // Focus back on textarea and set cursor position after the inserted mention
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPosition = atSignIndex + agent.name.length + 2; // +2 for @ and space
          textareaRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const newFiles = Array.from(e.target.files).map((file) => {
      const fileWithPreview = file as FileWithPreview;

      // Create preview URLs for images
      if (file.type.startsWith("image/")) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }

      return fileWithPreview;
    });

    setFiles([...files, ...newFiles]);

    // Reset the file input
    e.target.value = "";
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    // Focus the input after selecting an emoji
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  // Handle file removal
  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setFiles(files.filter((_, i) => i !== index));
  };

  // Handle send message
  const handleSend = () => {
    if (disabled) return;

    // Convert FileWithPreview[] to File[]
    const fileArray: File[] = files.map((file) => file as File);

    // Call the parent's onSendMessage with current message and files
    onSendMessage(message, fileArray);

    // Clear the input after sending
    setMessage("");
    setFiles([]);
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

  // Close mentions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mentionsRef.current &&
        !mentionsRef.current.contains(event.target as Node)
      ) {
        setShowMentions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter agents based on mention text
  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  return (
    <div className="relative">
      {/* File previews */}
      {files.length > 0 && (
        <div className="mb-2">
          <FilePreview files={files} onRemove={removeFile} />
        </div>
      )}

      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex-1 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden",
            borderColor ? `border-l-4 ${borderColor}` : ""
          )}
        >
          <div className="flex items-center">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={handleFileSelect}
              disabled={disabled}
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Textarea
              ref={textareaRef}
              placeholder={placeholder}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none resize-none py-3 px-0"
              rows={1}
              value={message}
              onChange={handleTextChange}
              disabled={disabled}
            />
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          </div>
        </div>
        <Button
          className={buttonColor}
          disabled={(!message && files.length === 0) || disabled}
          onClick={handleSend}
        >
          <Send className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </div>

      {/* @mentions dropdown */}
      {showMentions && agents.length > 0 && (
        <div ref={mentionsRef}>
          <MentionsDropdown
            agents={filteredAgents}
            filter={mentionFilter}
            onSelect={handleSelectAgent}
            onClose={() => setShowMentions(false)}
          />
        </div>
      )}
    </div>
  );
}
