import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEditInbox } from "@/context/edit-inbox-context";
import {
  AgentsDropdown,
  AgentOption,
} from "@/components/protected/settings/inbox/agents-dropdown";
import { useEffect, useState } from "react";
import { userService } from "@/lib/api/services/user";

export function TeamTab() {
  const { inbox, updateTeamMembers } = useEditInbox();
  const [availableAgents, setAvailableAgents] = useState<AgentOption[]>([]);
  const [agentsAlreadyAdded, setAgentsAlreadyAdded] = useState<AgentOption[]>(
    []
  );

  // Keep TS happy
  if (!inbox) return null;

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await userService.getUsers();
      const users = response.data;

      // Convert users to agent options
      const agentOptions = users.map((user) => ({
        label: user.name,
        value: user.id,
      }));

      setAvailableAgents(agentOptions);

      // Set already added agents
      if (inbox) {
        const addedAgents = agentOptions.filter((agent) =>
          inbox.users.some((user) => user.id === agent.value)
        );
        setAgentsAlreadyAdded(addedAgents);
      }
    };

    fetchUsers();
  }, [inbox]);

  const handleAgentsChange = (agents: AgentOption[]) => {
    setAgentsAlreadyAdded(agents);
    const agentIds = agents.map((agent) => agent.value);
    updateTeamMembers(agentIds);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage who has access to this inbox</CardDescription>
        </CardHeader>
        <CardContent>
          <AgentsDropdown
            availableAgents={availableAgents}
            agentsAlreadyAdded={agentsAlreadyAdded}
            onChange={handleAgentsChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
