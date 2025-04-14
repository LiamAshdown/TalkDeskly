import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeamMember } from "@/lib/interfaces";
import { TeamMemberRow } from "./team-member-row";
import { EditMemberDialog } from "./edit-member-dialog";

interface TeamMembersTableProps {
  members: TeamMember[];
  onDelete: (id: string) => void;
  onUpdateRole: (id: string, role: "Admin" | "Agent" | "Viewer") => void;
  onUpdateStatus: (id: string, status: "Active" | "Inactive") => void;
  onResendInvite: (email: string) => void;
}

export function TeamMembersTable({
  members,
  onDelete,
  onUpdateRole,
  onUpdateStatus,
  onResendInvite,
}: TeamMembersTableProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const handleEditMember = (member: TeamMember) => {
    setEditMember(member);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editMember) {
      // Update the member's role if it changed
      if (
        editMember.role !== members.find((m) => m.id === editMember.id)?.role
      ) {
        onUpdateRole(editMember.id, editMember.role);
      }

      // Update the member's status if it changed
      if (
        editMember.status !==
        members.find((m) => m.id === editMember.id)?.status
      ) {
        onUpdateStatus(
          editMember.id,
          editMember.status === "Active" ? "Active" : "Inactive"
        );
      }

      setIsEditDialogOpen(false);
      setEditMember(null);
    }
  };

  return (
    <>
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className={isMobile ? "hidden md:table-cell" : ""}>
                Role
              </TableHead>
              <TableHead className={isMobile ? "hidden md:table-cell" : ""}>
                Status
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No team members found
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TeamMemberRow
                  key={member.id}
                  member={member}
                  onDelete={onDelete}
                  onUpdateRole={onUpdateRole}
                  onUpdateStatus={onUpdateStatus}
                  onEdit={handleEditMember}
                  onResendInvite={onResendInvite}
                  isMobile={isMobile}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditMemberDialog
        member={editMember}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveEdit}
      />
    </>
  );
}
