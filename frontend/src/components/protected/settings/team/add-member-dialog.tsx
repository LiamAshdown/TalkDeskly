import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeamMember } from "@/lib/interfaces";

interface AddMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    member: Omit<TeamMember, "id" | "status" | "avatar" | "inboxes">
  ) => void;
}

export function AddMemberDialog({
  isOpen,
  onClose,
  onAdd,
}: AddMemberDialogProps) {
  const [newMember, setNewMember] = useState<{
    name: string;
    email: string;
    role: "Admin" | "Agent" | "Viewer";
  }>({
    name: "",
    email: "",
    role: "Agent",
  });

  const handleAdd = () => {
    onAdd(newMember);
    setNewMember({ name: "", email: "", role: "Agent" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Add a new team member to your workspace. They will have access based
            on their role.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newMember.name}
              onChange={(e) =>
                setNewMember({ ...newMember, name: e.target.value })
              }
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newMember.email}
              onChange={(e) =>
                setNewMember({ ...newMember, email: e.target.value })
              }
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={newMember.role}
              onValueChange={(value) =>
                setNewMember({
                  ...newMember,
                  role: value as "Admin" | "Agent" | "Viewer",
                })
              }
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Agent">Agent</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Admins can manage all settings, Agents can respond to
              conversations, Viewers can only view.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add Member</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
