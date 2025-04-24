"use client";

import React from "react";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMobileView } from "../../context/mobile-view-context";
import { cn } from "@/lib/utils";

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
  const { mobileView, setMobileView } = useMobileView();
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
        <div className="font-semibold">TalkDeskly</div>
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
      <div className="flex-1 hidden md:flex h-[calc(100vh-4rem)]">
        <div className="border-r">{inboxSidebar}</div>
        <div className="border-r w-[350px]">{conversationList}</div>
        <div className="h-full overflow-hidden flex-1">{chatPanel}</div>
        <div
          className={cn(
            "h-full border-l transition-all duration-300 ease-in-out overflow-hidden",
            isContactInfoOpen ? "w-80 opacity-100" : "w-0 opacity-0"
          )}
        >
          {contactInfo}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex-1 md:hidden h-[calc(100vh-4rem)] relative overflow-hidden">
        <div
          className={cn(
            "h-full w-full absolute transition-transform duration-300 ease-in-out",
            mobileView === "conversations"
              ? "translate-x-0"
              : "-translate-x-full"
          )}
        >
          {conversationList}
        </div>

        <div
          className={cn(
            "h-full w-full absolute transition-transform duration-300 ease-in-out",
            mobileView === "chat"
              ? "translate-x-0"
              : mobileView === "conversations"
              ? "translate-x-full"
              : "-translate-x-full"
          )}
        >
          {chatPanel}
        </div>

        <div
          className={cn(
            "h-full w-full absolute transition-transform duration-300 ease-in-out",
            mobileView === "contact" ? "translate-x-0" : "translate-x-full"
          )}
        >
          {contactInfo}
        </div>
      </div>
    </div>
  );
}
