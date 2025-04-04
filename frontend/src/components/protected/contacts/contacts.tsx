"use client";

import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { createColumns } from "@/components/protected/contacts/columns";
import {
  CreateContactDialog,
  EditContactDialog,
} from "@/components/protected/contacts/dialogs/contacts-dialog";
import { Contact } from "@/lib/interfaces";
import { useContactsStore } from "@/stores/contacts";
import { useTranslation } from "react-i18next";
export default function ContactsPage() {
  const { contacts, isLoading, fetchContacts, handleDeleteContact } =
    useContactsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery) {
      return contacts;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(lowercaseQuery) ||
        contact.email.toLowerCase().includes(lowercaseQuery) ||
        contact.company.toLowerCase().includes(lowercaseQuery) ||
        contact.phone.includes(lowercaseQuery)
    );
  }, [contacts, searchQuery]);

  const handleEditContact = (contact: Contact) => {
    setCurrentContact(contact);
    setIsEditDialogOpen(true);
  };

  const handleFetchContacts = async () => {
    setCurrentContact(null);
    setIsEditDialogOpen(false);
    setIsCreateDialogOpen(false);
  };

  const columns = createColumns({
    onEdit: handleEditContact,
    onDelete: handleDeleteContact,
  });

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <CreateContactDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCancel={() => {
            setIsCreateDialogOpen(false);
          }}
          onCreate={handleFetchContacts}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("contacts.searchContacts")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredContacts}
          isLoading={isLoading}
          autoResetPageIndex={false}
        />
      </div>

      <EditContactDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={
          currentContact
            ? {
                name: currentContact.name,
                email: currentContact.email,
                phone: currentContact.phone,
                company: currentContact.company,
              }
            : undefined
        }
        currentContactId={currentContact?.id}
        onCancel={() => {
          setCurrentContact(null);
          setIsEditDialogOpen(false);
        }}
        onUpdate={handleFetchContacts}
      />
    </div>
  );
}
