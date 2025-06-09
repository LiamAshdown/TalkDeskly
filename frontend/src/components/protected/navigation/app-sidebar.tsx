import type React from "react";
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MessageSquare,
  Users,
  HelpCircle,
  Bell,
  Settings,
  Moon,
  Sun,
  ChevronLeft,
  User,
  LogOut,
  Shield,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import NavItem from "@/components/protected/navigation/nav-item";
import { useMiscStore } from "@/stores/misc";
import { useAuthStore } from "@/stores/auth";
import { authService } from "@/lib/api/services/auth";
import { useNavigate } from "react-router-dom";

export function AppSidebar() {
  const { theme, sidebarCollapsed, toggleTheme, toggleSidebar } =
    useMiscStore();
  const location = useLocation();
  const { user, isSuperAdmin, isAdmin, logout } = useAuthStore();
  const { t } = useTranslation();
  const { appInformation } = useMiscStore();
  const navigate = useNavigate();

  // Add class to document on initial load
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);

  const handleLogout = () => {
    authService.logout();
    logout();
    navigate("/login");
  };

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
              <h1 className="font-semibold">{appInformation?.appName}</h1>
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
              label={t("sidebar.conversations")}
              active={location.pathname === "/"}
              collapsed={sidebarCollapsed}
              href="/portal"
            />
            <NavItem
              icon={<Users />}
              label={t("sidebar.contacts")}
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
              label={t("sidebar.notifications")}
              active={location.pathname === "/notifications"}
              collapsed={sidebarCollapsed}
              href="notifications"
            />
            <NavItem
              icon={<Settings />}
              label={t("sidebar.settings")}
              active={location.pathname.startsWith("/settings")}
              collapsed={sidebarCollapsed}
              href={isAdmin() ? "settings/inboxes" : "settings/account"}
            />
            <NavItem
              icon={theme === "dark" ? <Sun /> : <Moon />}
              label={
                theme === "dark"
                  ? t("sidebar.lightMode")
                  : t("sidebar.darkMode")
              }
              onClick={toggleTheme}
              collapsed={sidebarCollapsed}
            />
          </nav>
        </div>

        <Separator />

        {/* User Profile Section */}
        <div className="h-14 flex items-center px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full flex items-center gap-2 justify-start -ml-2",
                  sidebarCollapsed && "justify-center p-2 ml-0"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt="Agent" />
                  <AvatarFallback>
                    {user?.firstName.charAt(0)}
                    {user?.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {!sidebarCollapsed && (
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t("sidebar.online")}
                    </span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={sidebarCollapsed ? "center" : "start"}
              side="top"
              className="w-56"
            >
              <DropdownMenuLabel>{t("sidebar.myAccount")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  to="/portal/settings/account"
                  className="flex items-center"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>{t("sidebar.accountSettings")}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/portal/notifications" className="flex items-center">
                  <Bell className="mr-2 h-4 w-4" />
                  <span>{t("sidebar.notifications")}</span>
                </Link>
              </DropdownMenuItem>
              {isSuperAdmin() && (
                <DropdownMenuItem asChild>
                  <Link to="/superadmin" className="flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>{t("sidebar.superAdmin")}</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("sidebar.logOut")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        aria-label={
          sidebarCollapsed
            ? t("sidebar.expandSidebar")
            : t("sidebar.collapseSidebar")
        }
      >
        <ChevronLeft className="h-3 w-3" />
      </Button>
    </div>
  );
}
