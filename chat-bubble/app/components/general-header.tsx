import { X } from "lucide-react";

import { Button } from "~/components/ui/button";

import { MessageSquare } from "lucide-react";

export default function GeneralHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex justify-between items-center p-4">
      <div className="flex items-center">
        <div className="bg-primary h-10 w-10 rounded-full flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <span className="font-medium text-sm ml-3">Talk Deskly</span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>
    </div>
  );
}
