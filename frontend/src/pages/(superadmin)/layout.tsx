import type React from "react";
import { useState } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Users,
  Building,
  BarChart3,
  Menu,
  Settings,
  Shield,
  Database,
  Activity,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/context/use-is-mobile";
import { useAuthStore } from "@/stores/auth";
import { ThemeToggle } from "@/components/superadmin/theme-toggle";

interface SuperAdminNavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  description: string;
}

const superAdminNavItems: SuperAdminNavItem[] = [
  {
    title: "Back to Portal",
    href: "/portal",
    icon: ArrowLeft,
    description: "Return to main application",
  },
  {
    title: "Dashboard",
    href: "",
    icon: BarChart3,
    description: "System overview and statistics",
  },
  {
    title: "Users",
    href: "users",
    icon: Users,
    description: "Manage all system users",
  },
  {
    title: "Companies",
    href: "companies",
    icon: Building,
    description: "Manage all companies",
  },
  {
    title: "Configuration",
    href: "config",
    icon: Settings,
    description: "System configuration settings",
  },
  {
    title: "System Health",
    href: "system",
    icon: Activity,
    description: "Monitor system performance",
  },
];

function SuperAdminLayout() {
  const pathname = useLocation().pathname;
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isSuperAdmin } = useAuthStore();

  // Redirect if not superadmin
  if (!isSuperAdmin()) {
    return <Navigate to="/portal" replace />;
  }

  const SuperAdminNav = () => {
    return (
      <div className="space-y-1">
        {superAdminNavItems.map((item, index) => {
          const pathParts = pathname.split("/");
          const lastPathPart = pathParts[pathParts.length - 1];

          // Handle external links (like portal) - never show as active
          const isExternalLink = item.href.startsWith("/");
          const isActive =
            !isExternalLink &&
            ((item.href === "" && pathname === "/superadmin") ||
              (item.href !== "" &&
                (lastPathPart === item.href ||
                  pathname.startsWith(`/superadmin/${item.href}/`))));

          // Determine the link destination
          const linkTo = isExternalLink
            ? item.href
            : item.href === ""
            ? "/superadmin"
            : item.href;

          return (
            <div key={item.href}>
              <Link
                to={linkTo}
                className={cn(
                  "flex items-start gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors group",
                  isActive
                    ? "bg-red-50 text-red-700 border-l-4 border-red-500 dark:bg-red-900/20 dark:text-red-400"
                    : "text-muted-foreground hover:bg-red-50/50 hover:text-red-600 dark:hover:bg-red-900/10 dark:hover:text-red-400"
                )}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 mt-0.5 flex-shrink-0",
                    isActive
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground group-hover:text-red-500 dark:group-hover:text-red-400"
                  )}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {item.description}
                  </span>
                </div>
              </Link>
              {/* Add separator after Back to Portal link */}
              {index === 0 && <Separator className="my-3" />}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile header with menu */}
      <div className="md:hidden border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-red-600" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            SuperAdmin
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="h-6 w-6 text-red-600" />
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    SuperAdmin
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  System administration and management
                </p>
                <SuperAdminNav />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="flex flex-1 min-h-[calc(100vh-80px)] md:min-h-screen">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden md:block w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    SuperAdmin
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    System Management
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
          <nav className="p-4">
            <SuperAdminNav />
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default SuperAdminLayout;
