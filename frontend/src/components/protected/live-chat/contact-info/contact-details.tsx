import { Phone, Mail, MapPin } from "lucide-react";
import type { Contact } from "@/lib/interfaces";

interface ContactDetailsProps {
  contact: Contact;
}

export function ContactDetails({ contact }: ContactDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Phone className="h-4 w-4 text-muted-foreground" />
        <span>{contact.phone}</span>
      </div>
      <div className="flex items-center gap-3">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <span>{contact.email}</span>
      </div>
      {/* {contact.location && (
        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{contact.location}</span>
        </div>
      )} */}
    </div>
  );
}
