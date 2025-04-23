import { MessageSquare } from "lucide-react";
import SettingsContent from "@/components/protected/settings/settings-content";

interface ChannelSelectProps {
  onSelect: (channel: string) => void;
}

export function ChannelSelect({ onSelect }: ChannelSelectProps) {
  return (
    <SettingsContent
      title="    Choose a channel"
      description="Choose a channel to integrate with your inbox. Currently, we only
          support website live-chat widget."
      showBackButton={false}
    >
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
        <button
          onClick={() => onSelect("website")}
          className="flex flex-col items-center gap-4 p-4 sm:p-6 rounded-lg border bg-card text-card-foreground hover:bg-accent/50 transition-colors"
        >
          <div className="p-4 bg-blue-100 rounded-lg">
            <MessageSquare className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold mb-1">Website</h3>
            <p className="text-sm text-muted-foreground">
              Add live chat to your website
            </p>
          </div>
        </button>

        {/* Other channel options would go here, but they're disabled for now */}
      </div>
    </SettingsContent>
  );
}
