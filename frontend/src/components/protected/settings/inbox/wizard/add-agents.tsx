import { useTranslation } from "react-i18next";
import {
  AgentOption,
  AgentsDropdown,
} from "@/components/protected/settings/inbox/agents-dropdown";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { inboxService } from "@/lib/api/services/inbox";
import { Inbox } from "@/lib/interfaces";

interface AddAgentsProps {
  inboxID: string;
  availableAgents?: Array<{
    label: string;
    value: string;
  }>;
  agentsAlreadyAdded?: Array<{
    label: string;
    value: string;
  }>;
  onCreated: (inbox: Inbox) => void;
  required?: boolean;
  className?: string;
}

export function AddAgents({
  availableAgents,
  agentsAlreadyAdded,
  onCreated,
  required,
  className,
  inboxID,
}: AddAgentsProps) {
  const { t } = useTranslation();
  const [selectedAgents, setSelectedAgents] = useState<AgentOption[]>([]);

  const handleSubmit = async () => {
    try {
      const response = await inboxService.updateInboxUsers(inboxID, {
        agentIDs: selectedAgents.map((agent) => agent.value),
      });

      onCreated(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (agents: AgentOption[]) => {
    setSelectedAgents(agents);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">{t("agents.title")}</h2>
        <p className="text-muted-foreground">{t("agents.description")}</p>
      </div>

      <AgentsDropdown
        availableAgents={availableAgents}
        agentsAlreadyAdded={agentsAlreadyAdded}
        onChange={handleChange}
        className={className}
      />

      <Button
        type="button"
        disabled={selectedAgents.length === 0 && required}
        onClick={handleSubmit}
        className="mt-4"
      >
        {t("agents.submit")}
      </Button>
    </div>
  );
}
