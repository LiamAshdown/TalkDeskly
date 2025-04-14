import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeamMember } from "@/lib/interfaces";
import { TeamMemberActions } from "./team-member-actions";

interface TeamMemberRowProps {
  member: TeamMember;
  onDelete: (id: string) => void;
  onUpdateRole: (id: string, role: "admin" | "agent") => void;
  onUpdateStatus: (id: string, status: "Active" | "Inactive") => void;
  onEdit: (member: TeamMember) => void;
  onResendInvite: (id: string) => void;
  isMobile: boolean;
}

export function TeamMemberRow({
  member,
  onDelete,
  onUpdateRole,
  onUpdateStatus,
  onEdit,
  onResendInvite,
  isMobile,
}: TeamMemberRowProps) {
  return (
    <tr>
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback>
              {member.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{member.name}</div>
            <div className="text-sm text-muted-foreground">{member.email}</div>
            {isMobile && (
              <div className="md:hidden flex flex-wrap gap-1 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {member.role}
                </Badge>
                {member.status === "Invited" && (
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 border-yellow-200"
                  >
                    Invited
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </td>
      {!isMobile && (
        <td className="py-4 px-4">
          <Select
            value={member.role}
            disabled={member.status === "Invited"}
            onValueChange={(value) =>
              onUpdateRole(member.id, value as "admin" | "agent")
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
            </SelectContent>
          </Select>
        </td>
      )}
      {!isMobile && (
        <td className="py-4 px-4">
          {member.status === "Invited" ? (
            <Badge
              variant="outline"
              className="bg-yellow-50 text-yellow-700 border-yellow-200"
            >
              Invited
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              Active
            </Badge>
          )}
        </td>
      )}
      <td className="text-right py-4 px-4">
        <TeamMemberActions
          member={member}
          onDelete={onDelete}
          onEdit={onEdit}
          onResendInvite={onResendInvite}
        />
      </td>
    </tr>
  );
}
