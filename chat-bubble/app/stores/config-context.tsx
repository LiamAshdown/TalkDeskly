import React, { createContext, useContext, useState } from "react";
import type { Config } from "~/types/config";

type ConfigContextType = {
  config: Config;
  setConfig: (config: Config) => void;
};

const ConfigContext = createContext<ConfigContextType | null>(null);

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("Config not found");
  }
  return context;
};

type ConfigProviderProps = {
  children: React.ReactNode;
  initialConfig?: Partial<Config>;
};

export const ConfigProvider = ({
  children,
  initialConfig,
}: ConfigProviderProps) => {
  const [config, setConfig] = useState<Config>({
    inboxId: "",
    position: "bottom-right",
    primaryColor: "#000000",
    zIndex: 1000,
    ...initialConfig,
  });

  return (
    <ConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};
