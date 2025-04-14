import { useState } from "react";
import { Search, Mail, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InviteMembersDialog } from "./invite-members-dialog";
import { AddMemberDialog } from "./add-member-dialog";

interface TeamSettingsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onInvite: (emails: string[]) => void;
  onAdd: (member: {
    name: string;
    email: string;
    role: "Admin" | "Agent" | "Viewer";
  }) => void;
}

export function TeamSettingsHeader({
  searchQuery,
  onSearchChange,
  onInvite,
  onAdd,
}: TeamSettingsHeaderProps) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex gap-2">
        <InviteMembersDialog
          isOpen={isInviteDialogOpen}
          onClose={() => setIsInviteDialogOpen(false)}
          onInvite={onInvite}
        />
        <Button variant="outline" onClick={() => setIsInviteDialogOpen(true)}>
          <Mail className="h-4 w-4 mr-2" />
          Invite
        </Button>

        <AddMemberDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onAdd={onAdd}
        />
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <Tabs defaultValue="all">
        <div className="flex md:items-center md:justify-between justify-start mb-4 sm:flex-row flex-col items-start gap-2">
          <TabsList className="w-full sm:w-auto inline-flex">
            <TabsTrigger value="all">All Members</TabsTrigger>
            <TabsTrigger value="invited">Invited</TabsTrigger>
          </TabsList>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search members..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </Tabs>
    </div>
  );
}
