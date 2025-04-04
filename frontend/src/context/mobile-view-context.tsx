import React, { createContext, useContext, useState, ReactNode } from "react";

type MobileView = "conversations" | "chat" | "contact";

interface MobileViewContextProps {
  mobileView: MobileView;
  setMobileView: (view: MobileView) => void;
}

const MobileViewContext = createContext<MobileViewContextProps | undefined>(
  undefined
);

export const MobileViewProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [mobileView, setMobileView] = useState<MobileView>("chat");

  return (
    <MobileViewContext.Provider value={{ mobileView, setMobileView }}>
      {children}
    </MobileViewContext.Provider>
  );
};

export const useMobileView = () => {
  const context = useContext(MobileViewContext);
  if (!context) {
    throw new Error("useMobileView must be used within a MobileViewProvider");
  }
  return context;
};
