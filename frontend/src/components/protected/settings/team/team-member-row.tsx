import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TeamMember } from "@/lib/interfaces";
import { TeamMemberActions } from "./team-member-actions";

interface TeamMemberRowProps {
  member: TeamMember;
  onDelete: (id: string) => void;
  onUpdateRole: (id: string, role: "admin" | "agent") => void;
  onResendInvite: (id: string) => void;
}

export function TeamMemberRow({
  member,
  onDelete,
  onResendInvite,
  onUpdateRole,
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
          </div>
        </div>
      </td>
      <td className="py-4 px-4 capitalize">{member.role}</td>
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
      <td className="text-right py-4 px-4">
        <TeamMemberActions
          member={member}
          onDelete={onDelete}
          onResendInvite={onResendInvite}
          onUpdateRole={onUpdateRole}
        />
      </td>
    </tr>
  );
}
