import { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Contact } from "@/lib/interfaces";
import { DeleteContactDialog } from "@/components/protected/contacts/dialogs/delete-contact-dialog";

type ContactsColumnProps = {
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
};

export const createColumns = ({
  onEdit,
  onDelete,
}: ContactsColumnProps): ColumnDef<Contact>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const contact = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={""} alt={contact.name} />
            <AvatarFallback>
              {contact.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{contact.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "company",
    header: "Company",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const contact = row.original;

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(contact)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {/* <DeleteContactDialog
                contact={contact}
                onDelete={onDelete}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                }
              /> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
