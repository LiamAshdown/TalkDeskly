"use client";

import { X, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Contact } from "@/lib/interfaces";
import { ContactHeader } from "./contact-info/contact-header";
import { ContactDetails } from "./contact-info/contact-details";
import { CustomerDetails } from "./contact-info/customer-details";
import { NotesSection } from "./contact-info/notes-section";
import { PreviousConversations } from "./contact-info/previous-conversations";
import { useActiveConversation } from "@/context/active-conversation-context";
import { useMobileView } from "@/context/mobile-view-context";

export default function ContactInfo() {
  const { activeConversation, setIsContactInfoOpen } = useActiveConversation();
  const { setMobileView } = useMobileView();

  // Create a contact object that matches the Contact interface
  // Use type assertion and add missing properties
  const contact: Contact | null = activeConversation?.contact
    ? {
        id: activeConversation.contact.id,
        name: activeConversation.contact.name,
        email: activeConversation.contact.email,
        phone: activeConversation.contact.phone,
        company: "",
        companyId: "",
        createdAt: "",
        updatedAt: "",
      }
    : null;

  const handleClose = () => {
    setIsContactInfoOpen(false);
    setMobileView("chat");
  };

  if (!contact) {
    return null;
  }

  return (
    <div className="w-full lg:w-80 border-l h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={handleClose}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold">Contact Information</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 overflow-auto h-[calc(100vh-4rem)]">
        <ContactHeader contact={contact} />

        <ContactDetails contact={contact} />

        <Separator className="my-4" />

        <CustomerDetails contact={contact} />

        <Separator className="my-4" />

        <NotesSection contact={contact} />

        <Separator className="my-4" />

        <PreviousConversations contact={contact} />

        <div className="mt-6">
          <Button variant="outline" className="w-full">
            View Full Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
