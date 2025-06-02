import { Badge } from "@/components/ui/badge";
import { Crown, Shield, User } from "lucide-react";

interface UserRoleBadgeProps {
  role: string;
  variant?: "default" | "secondary";
  size?: "sm" | "md";
}

const getRoleIcon = (role: string, size: "sm" | "md" = "md") => {
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  switch (role.toLowerCase()) {
    case "superadmin":
      return <Crown className={iconSize} />;
    case "admin":
      return <Crown className={iconSize} />;
    case "agent":
      return <Shield className={iconSize} />;
    case "user":
      return <User className={iconSize} />;
    default:
      return <User className={iconSize} />;
  }
};

const getRoleBadgeColor = (role: string) => {
  switch (role.toLowerCase()) {
    case "superadmin":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
    case "admin":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    case "agent":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    case "user":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

export function UserRoleBadge({
  role,
  variant = "secondary",
  size = "md",
}: UserRoleBadgeProps) {
  return (
    <Badge variant={variant} className={getRoleBadgeColor(role)}>
      <div className="flex items-center gap-1">
        {getRoleIcon(role, size)}
        <span className="capitalize">{role}</span>
      </div>
    </Badge>
  );
}
