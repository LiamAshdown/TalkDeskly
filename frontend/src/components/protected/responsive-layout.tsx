"use client";

import React from "react";
import { useState } from "react";
import { Menu, MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMobileView } from "../../context/mobile-view-context";

interface ResponsiveLayoutProps {
  inboxSidebar: React.ReactNode;
  conversationList: React.ReactNode;
  chatPanel: React.ReactNode;
  contactInfo: React.ReactNode;
  isContactInfoOpen?: boolean;
}

export default function ResponsiveLayout({
  inboxSidebar,
  conversationList,
  chatPanel,
  contactInfo,
  isContactInfoOpen = true,
}: ResponsiveLayoutProps) {
  const { mobileView } = useMobileView();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden border-b flex items-center justify-between p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="font-semibold">Agent Portal</div>
        {/* To center the Agent Portal text */}
        <div></div>
      </div>

      {/* Mobile Sidebar using Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-80">
          {React.cloneElement(inboxSidebar as React.ReactElement, {
            isMobile: true,
            onClose: () => setSidebarOpen(false),
          })}
        </SheetContent>
      </Sheet>

      {/* Desktop Layout */}
      <div
        className={`flex-1 hidden md:grid ${
          isContactInfoOpen
            ? "md:grid-cols-[auto_350px_1fr_auto]"
            : "md:grid-cols-[auto_350px_1fr]"
        } h-[calc(100vh-4rem)]`}
      >
        <div className="border-r">{inboxSidebar}</div>
        <div className="border-r">{conversationList}</div>
        <div className="h-full overflow-hidden">{chatPanel}</div>
        {isContactInfoOpen && (
          <div className="hidden lg:block">{contactInfo}</div>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="flex-1 md:hidden h-[calc(100vh-4rem)]">
        {mobileView === "conversations" && (
          <div className="h-full overflow-hidden">{conversationList}</div>
        )}
        {mobileView === "chat" && (
          <div className="h-full overflow-hidden">{chatPanel}</div>
        )}
        {mobileView === "contact" && (
          <div className="h-full overflow-hidden">{contactInfo}</div>
        )}
      </div>
    </div>
  );
}
