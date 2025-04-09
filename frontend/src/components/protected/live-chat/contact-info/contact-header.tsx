import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Contact } from "@/lib/interfaces";
import { generateAvatarUrl } from "@/lib/utils/avatar";

interface ContactHeaderProps {
  contact: Contact;
}

export function ContactHeader({ contact }: ContactHeaderProps) {
  return (
    <div className="flex flex-col items-center mb-6">
      <Avatar className="h-20 w-20 mb-4">
        <AvatarImage
          src={generateAvatarUrl(contact.name, "initials", 80)}
          alt={contact.name}
        />
        <AvatarFallback>
          {contact.name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <h2 className="text-xl font-bold">{contact.name}</h2>
      <p className="text-sm text-muted-foreground">{contact.company}</p>
    </div>
  );
}
