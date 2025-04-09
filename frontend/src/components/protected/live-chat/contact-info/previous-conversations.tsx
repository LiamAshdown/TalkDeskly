import { Button } from "@/components/ui/button";
import type { Contact } from "@/lib/interfaces";

interface PreviousConversationsProps {
  contact: Contact;
}

export function PreviousConversations({ contact }: PreviousConversationsProps) {
  return (
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
  );
}
