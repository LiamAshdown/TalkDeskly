import { useEffect, useState } from "react";
import { Plus, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Contact, ContactNote } from "@/lib/interfaces";
import { contactsService } from "@/lib/api/services/contacts";
import { useWebSocket } from "@/context/websocket-context";
import { useTranslation } from "react-i18next";
import { ScrollableContainer } from "@/components/ui/scrollable-container";
import { format } from "date-fns";

interface NotesSectionProps {
  contact: Contact;
}

export function NotesSection({ contact }: NotesSectionProps) {
  const [notes, setNotes] = useState<ContactNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { wsService } = useWebSocket();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const response = await contactsService.getContactNotes(contact.id);
        setNotes(response.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotes();

    wsService.subscribe("contact:" + contact.id);

    return () => {
      wsService.unsubscribe("contact:" + contact.id);
    };
  }, [contact.id]);

  useEffect(() => {
    const handleContactNoteCreated = (message: {
      event: string;
      payload: ContactNote;
    }) => {
      console.log("message", message);
      const newNote = message.payload;
      // Only add the note if it belongs to the current contact
      if (newNote.contactId === contact.id) {
        setNotes((prevNotes) => [newNote, ...prevNotes]);
      }
    };

    wsService.registerHandler("contact_note_created", handleContactNoteCreated);

    return () => {
      wsService.unregisterHandler(
        "contact_note_created",
        handleContactNoteCreated
      );
    };
  }, [contact.id, wsService]);

  const handleAddNote = async () => {
    if (newNote.trim()) {
      await contactsService.createContactNote(contact.id, newNote);
      setNewNote("");
      setIsAddingNote(false);
    }
  };

  return (
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
          {t("contacts.notes.addNote")}
        </Button>
      </div>

      {isAddingNote && (
        <div className="space-y-2">
          <Textarea
            placeholder={t("contacts.notes.placeholder")}
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
              {t("contacts.notes.cancel")}
            </Button>
            <Button size="sm" onClick={handleAddNote}>
              {t("contacts.notes.save")}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <ScrollableContainer>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-muted/50">
                <CardContent className="p-3">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex justify-between items-center mt-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollableContainer>
      ) : notes.length > 0 ? (
        <ScrollableContainer>
          <div className="space-y-3">
            {notes.map((note) => (
              <Card key={note.id} className="bg-muted/50">
                <CardContent className="p-3">
                  <p className="text-sm">{note.content}</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                    <span>{note.user.name}</span>
                    <span>{format(note.createdAt, "MM/dd/yyyy")}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollableContainer>
      ) : (
        <div className="text-center text-sm text-muted-foreground py-4">
          <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{t("contacts.notes.noNotes")}</p>
        </div>
      )}
    </div>
  );
}
