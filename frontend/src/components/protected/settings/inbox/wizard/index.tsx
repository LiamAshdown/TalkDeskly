import { useState } from "react";
import { ChannelSelect } from "./channel-select";
import { WebsiteWizard } from "./website";

export function InboxWizard() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const handleChannelSelect = (channel: string) => {
    setSelectedChannel(channel);
  };

  if (!selectedChannel) {
    return <ChannelSelect onSelect={handleChannelSelect} />;
  }

  switch (selectedChannel) {
    case "website":
      return <WebsiteWizard />;
    default:
      return null;
  }
}
