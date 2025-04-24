"use client";

import { Agent } from "@/lib/interfaces";

interface MentionsDropdownProps {
  agents: Agent[];
  filter: string;
  onSelect: (agent: Agent) => void;
  onClose: () => void;
}

export default function MentionsDropdown({
  agents,
  filter,
  onSelect,
  onClose,
}: MentionsDropdownProps) {
  // Filter agents based on mention text
  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="absolute bottom-full left-0 mb-2 w-full max-h-60 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
      <div className="p-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mention a team member
        </h3>

        {filteredAgents.length > 0 ? (
          <ul className="space-y-1">
            {filteredAgents.map((agent) => (
              <li
                key={agent.id}
                className="px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                onClick={() => onSelect(agent)}
              >
                {agent.avatar && (
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="h-6 w-6 rounded-full mr-2"
                  />
                )}
                <div>
                  <div className="font-medium">{agent.name}</div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 p-2">
            No matching team members found
          </p>
        )}
      </div>
    </div>
  );
}
