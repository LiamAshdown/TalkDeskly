"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  X,
  StickyNote,
  Plus,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import type { Contact, Note } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ContactInfoProps {
  contact: Contact | null;
  onAddNote?: (note: Note) => void;
  onClose?: () => void;
}

export default function ContactInfo({
  contact,
  onAddNote,
  onClose = () => {},
}: ContactInfoProps) {
  const [notes, setNotes] = useState<Note[]>(contact?.notes || []);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  if (!contact) {
    return null;
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: `note${Date.now()}`,
        content: newNote,
        createdAt: new Date().toLocaleDateString(),
        createdBy: "Current Agent",
      };
      setNotes([note, ...notes]);
      setNewNote("");
      setIsAddingNote(false);

      // Call the onAddNote prop if provided
      if (onAddNote) {
        onAddNote(note);
      }
    }
  };

  return (
    <div className="w-full lg:w-80 border-l h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold">Contact Information</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 overflow-auto h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarImage src={contact.avatar} alt={contact.name} />
            <AvatarFallback>
              {contact.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{contact.name}</h2>
          <p className="text-sm text-muted-foreground">{contact.company}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{contact.phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{contact.email}</span>
          </div>
          {contact.location && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{contact.location}</span>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <h3 className="font-semibold">Customer Details</h3>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Customer since</p>
              <p className="text-sm text-muted-foreground">
                {contact.customerSince}
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notes</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingNote(true)}
              className={cn(isAddingNote && "hidden")}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Note
            </Button>
          </div>

          {isAddingNote && (
            <div className="space-y-2">
              <Textarea
                placeholder="Type your note here..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingNote(false);
                    setNewNote("");
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddNote}>
                  Save Note
                </Button>
              </div>
            </div>
          )}

          {notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((note) => (
                <Card key={note.id} className="bg-muted/50">
                  <CardContent className="p-3">
                    <p className="text-sm">{note.content}</p>
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                      <span>{note.createdBy}</span>
                      <span>{note.createdAt}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-4">
              <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notes yet</p>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <div>
          <h3 className="font-semibold mb-2">Previous Conversations</h3>
          <ul className="space-y-2">
            {contact.previousConversations?.map((conv, index) => (
              <li key={index} className="text-sm">
                <Button variant="link" className="p-0 h-auto text-sm">
                  {conv.topic} - {conv.date}
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <Button variant="outline" className="w-full">
            View Full Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
