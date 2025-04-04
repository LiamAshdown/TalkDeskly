"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function Header({ onMobileBack }: { onMobileBack?: () => void }) {
  return (
    <div className="p-4 border-b flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => onMobileBack && onMobileBack()}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h2 className="text-lg font-semibold">Conversations</h2>
    </div>
  );
}

export default Header;
