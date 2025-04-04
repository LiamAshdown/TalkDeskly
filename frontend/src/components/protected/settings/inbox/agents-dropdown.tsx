"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Select from "react-select";
import { useTranslation } from "react-i18next";

interface AgentsDropdownProps {
  availableAgents?: Array<{
    label: string;
    value: string;
  }>;
  agentsAlreadyAdded?: Array<{
    label: string;
    value: string;
  }>;
  className?: string;
  onChange?: (agents: AgentOption[]) => void;
}

export type AgentOption = {
  label: string;
  value: string;
};

export function AgentsDropdown({
  availableAgents = [],
  agentsAlreadyAdded = [],
  className = "",
  onChange,
}: AgentsDropdownProps) {
  const { t } = useTranslation();
  const [selectedAgents, setSelectedAgents] =
    useState<AgentOption[]>(agentsAlreadyAdded);
  const isDark = document.documentElement.classList.contains("dark");

  // Custom styles for react-select to match our theme
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: isDark ? "hsl(var(--background))" : "white",
      borderColor: "hsl(var(--input))",
      boxShadow: "none",
      "&:hover": {
        borderColor: "hsl(var(--input))",
      },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: isDark ? "hsl(var(--popover))" : "white",
      borderRadius: "var(--radius)",
      border: "1px solid hsl(var(--border))",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused
        ? isDark
          ? "hsl(var(--accent))"
          : "hsl(var(--accent))"
        : state.isSelected
        ? isDark
          ? "hsl(var(--primary))"
          : "hsl(var(--primary))"
        : "transparent",
      color: state.isSelected
        ? isDark
          ? "hsl(var(--primary-foreground))"
          : "hsl(var(--primary-foreground))"
        : state.isFocused
        ? isDark
          ? "hsl(var(--accent-foreground))"
          : "hsl(var(--accent-foreground))"
        : isDark
        ? "hsl(var(--popover-foreground))"
        : "hsl(var(--foreground))",
      cursor: "pointer",
      ":active": {
        backgroundColor: isDark ? "hsl(var(--accent))" : "hsl(var(--accent))",
      },
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: isDark
        ? "hsl(var(--secondary))"
        : "hsl(var(--secondary))",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: isDark
        ? "hsl(var(--secondary-foreground))"
        : "hsl(var(--secondary-foreground))",
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: isDark
        ? "hsl(var(--secondary-foreground))"
        : "hsl(var(--secondary-foreground))",
      ":hover": {
        backgroundColor: isDark
          ? "hsl(var(--destructive))"
          : "hsl(var(--destructive))",
        color: "white",
      },
    }),
    input: (base: any) => ({
      ...base,
      color: isDark ? "hsl(var(--foreground))" : "hsl(var(--foreground))",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "hsl(var(--muted-foreground))",
    }),
    singleValue: (base: any) => ({
      ...base,
      color: isDark ? "hsl(var(--foreground))" : "hsl(var(--foreground))",
    }),
  };

  useEffect(() => {
    setSelectedAgents(agentsAlreadyAdded);
  }, [agentsAlreadyAdded]);

  return (
    <div className={className}>
      <div className="space-y-6 max-w-md">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("agents.select.label")}
          </label>
          <Select
            isMulti
            name="agents"
            options={availableAgents}
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder={t("agents.select.placeholder")}
            value={selectedAgents}
            onChange={(selected) => {
              setSelectedAgents(selected as AgentOption[]);
              onChange?.(selected as AgentOption[]);
            }}
            styles={selectStyles}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {t("agents.select.help")}
          </p>
        </div>

        {selectedAgents.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              {t("agents.selected.title", { count: selectedAgents.length })}
            </h3>
            <div className="space-y-2">
              {selectedAgents.map((agent) => (
                <div
                  key={agent.value}
                  className="flex items-center gap-2 p-3 rounded-lg border"
                >
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{agent.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
