import { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeamMember } from "@/lib/interfaces";

interface EditMemberDialogProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: TeamMember) => void;
}

export function EditMemberDialog({
  member,
  isOpen,
  onClose,
  onSave,
}: EditMemberDialogProps) {
  const [editedMember, setEditedMember] = useState<TeamMember | null>(null);

  // Update editedMember when member prop changes
  useEffect(() => {
    if (member) {
      setEditedMember(member);
    }
  }, [member]);

  if (!editedMember) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogDescription>
            Update information for this team member.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={editedMember.avatar} alt={editedMember.name} />
              <AvatarFallback>
                {editedMember.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{editedMember.name}</h3>
              <p className="text-sm text-muted-foreground">
                {editedMember.email}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-role">Role</Label>
            <Select
              value={editedMember.role}
              onValueChange={(value) =>
                setEditedMember({
                  ...editedMember,
                  role: value as "Admin" | "Agent" | "Viewer",
                })
              }
            >
              <SelectTrigger id="edit-role">
                <SelectValue />
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
          {editedMember.status !== "Invited" && (
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editedMember.status}
                onValueChange={(value) =>
                  setEditedMember({
                    ...editedMember,
                    status: value as "Active" | "Inactive",
                  })
                }
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(editedMember)}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
