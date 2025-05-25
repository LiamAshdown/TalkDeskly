import type React from "react";
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  MessageSquare,
  Users,
  HelpCircle,
  Bell,
  Settings,
  Moon,
  Sun,
  ChevronLeft,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import NavItem from "@/components/protected/navigation/nav-item";
import { useMiscStore } from "@/stores/misc";

export function AppSidebar() {
  const { theme, sidebarCollapsed, toggleTheme, toggleSidebar } =
    useMiscStore();
  const location = useLocation();

  // Add class to document on initial load
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);

  return (
    <div className="relative">
      <div
        className={cn(
          "h-screen border-r bg-background flex flex-col transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header Section */}
        <div className="h-14 flex items-center px-4">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h1 className="font-semibold">TalkDeskly</h1>
            </div>
          )}
          {sidebarCollapsed && <MessageSquare className="h-5 w-5 mx-auto" />}
        </div>
        <Separator />

        {/* Main Navigation Section */}
        <div className="flex-1">
          <nav className="space-y-1 p-2">
            <NavItem
              icon={<MessageSquare />}
              label="Conversations"
              active={location.pathname === "/"}
              collapsed={sidebarCollapsed}
              href="/portal"
            />
            <NavItem
              icon={<Users />}
              label="Contacts"
              active={location.pathname === "/contacts"}
              collapsed={sidebarCollapsed}
              href="contacts"
            />
          </nav>

          <Separator className="my-2" />

          {/* Utilities Section */}
          <nav className="space-y-1 p-2">
            <NavItem
              icon={<Bell />}
              label="Notifications"
              active={location.pathname === "/notifications"}
              collapsed={sidebarCollapsed}
              href="notifications"
            />
            <NavItem
              icon={<Settings />}
              label="Settings"
              active={location.pathname.startsWith("/settings")}
              collapsed={sidebarCollapsed}
              href="settings/inboxes"
            />
            <NavItem
              icon={theme === "dark" ? <Sun /> : <Moon />}
              label={theme === "dark" ? "Light Mode" : "Dark Mode"}
              onClick={toggleTheme}
              collapsed={sidebarCollapsed}
            />
          </nav>
        </div>

        <Separator />

        {/* User Profile Section */}
        <div className="h-14 flex items-center px-4">
          <Button
            variant="ghost"
            className={cn(
              "w-full flex items-center gap-2 justify-start -ml-2",
              sidebarCollapsed && "justify-center p-2 ml-0"
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src="/placeholder.svg?height=32&width=32"
                alt="Agent"
              />
              <AvatarFallback>AG</AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium">Agent Name</span>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Chevron button positioned on the edge of the sidebar */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className={cn(
          "absolute top-4 -right-3 h-6 w-6 rounded-full border bg-background shadow-sm",
          sidebarCollapsed ? "rotate-180" : ""
        )}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft className="h-3 w-3" />
      </Button>
    </div>
  );
}
