import type React from "react";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { User, Inbox, Users, Building, Menu, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/context/use-is-mobile";
import { useAuthStore } from "@/stores/auth";

interface SettingsNavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const settingsNavItems: SettingsNavItem[] = [
  {
    title: "Account",
    href: "account",
    icon: User,
    roles: ["admin", "agent"],
  },
  {
    title: "Inboxes",
    href: "inboxes",
    icon: Inbox,
    roles: ["admin"],
  },
  {
    title: "Team Members",
    href: "team",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Canned Responses",
    href: "canned-responses",
    icon: FileText,
    roles: ["agent", "admin"],
  },
  {
    title: "Company",
    href: "company",
    icon: Building,
    roles: ["admin"],
  },
];

export default function SettingsLayout() {
  const pathname = useLocation().pathname;
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { hasRole } = useAuthStore();

  const SettingsNav = () => {
    return (
      <div className="space-y-1">
        {settingsNavItems.map((item) => {
          const pathParts = pathname.split("/");
          const lastPathPart = pathParts[pathParts.length - 1];

          const isActive =
            lastPathPart === item.href || pathname?.startsWith(`${item.href}/`);

          if (!hasRole(item.roles)) {
            return null;
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              )}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full">
      {/* Mobile header with menu */}
      <div className="md:hidden border-b flex items-center justify-between p-2 pl-4">
        <h1 className="text-xl font-semibold">Settings</h1>
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold">Settings</h1>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Manage your account and workspace
              </p>
              <SettingsNav />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop layout */}
      <div className="flex-1 flex overflow-y-auto h-[calc(100vh-80px)] md:h-full">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden bg-muted/60 md:block w-64 border-r overflow-y-auto">
          <div className="p-4">
            <h1 className="text-xl font-semibold ">Settings</h1>
          </div>
          <nav className="px-2 pb-4">
            <SettingsNav />
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
