"use client";

import React from "react";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMobileView } from "@/context/mobile-view-context";
import { useActiveConversation } from "@/context/active-conversation-context";

interface ResponsiveLayoutProps {
  inboxSidebar: React.ReactNode;
  conversationList: React.ReactNode;
  chatPanel: React.ReactNode;
  contactInfo: React.ReactNode;
}

export default function ResponsiveLayout({
  inboxSidebar,
  conversationList,
  chatPanel,
  contactInfo,
}: ResponsiveLayoutProps) {
  const { mobileView } = useMobileView();
  const { isContactInfoOpen } = useActiveConversation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log("mobileView", mobileView);

  return (
    <div className="h-full flex flex-col">
      {/* Mobile header with menu */}
      <div className="md:hidden border-b flex items-center justify-between p-2 pl-4">
        <div className="font-semibold">Agent Portal</div>
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            {React.cloneElement(inboxSidebar as React.ReactElement, {
              isMobile: true,
              onClose: () => setSidebarOpen(false),
            })}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Layout */}
      <div
        className={`flex-1 hidden md:grid ${
          isContactInfoOpen
            ? "md:grid-cols-[auto_350px_1fr_auto]"
            : "md:grid-cols-[auto_350px_1fr]"
        } h-[calc(100vh-4rem)]`}
      >
        <div className="border-r h-full overflow-hidden">{inboxSidebar}</div>
        <div className="border-r h-full overflow-hidden">
          {conversationList}
        </div>
        <div className="h-full overflow-hidden">{chatPanel}</div>
        {isContactInfoOpen && (
          <div className="hidden lg:block h-full overflow-hidden">
            {contactInfo}
          </div>
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
