import { Clock } from "lucide-react";
import type { Contact } from "@/lib/interfaces";

interface CustomerDetailsProps {
  contact: Contact;
}

export function CustomerDetails({ contact }: CustomerDetailsProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Customer Details</h3>
      <div className="flex items-center gap-3">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Customer since</p>
          <p className="text-sm text-muted-foreground">{contact.createdAt}</p>
        </div>
      </div>
    </div>
  );
}
