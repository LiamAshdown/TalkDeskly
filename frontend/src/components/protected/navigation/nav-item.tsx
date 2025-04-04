import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
  href?: string;
}

export default function NavItem({
  icon,
  label,
  active = false,
  collapsed = false,
  onClick,
  href,
}: NavItemProps) {
  const content = (
    <>
      <span className={collapsed ? "m-0" : "mr-2"}>{icon}</span>
      {!collapsed && <span>{label}</span>}
    </>
  );

  if (href) {
    return (
      <Link
        to={href}
        className={cn(
          "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
          collapsed ? "justify-center px-0" : "justify-start px-3",
          active
            ? "bg-secondary text-secondary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      className={cn(
        "w-full",
        collapsed ? "justify-center px-0" : "justify-start px-3",
        active && "font-medium"
      )}
      onClick={onClick}
    >
      {content}
    </Button>
  );
}
