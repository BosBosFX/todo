import React, { createContext, useContext, type ReactNode } from "react";
import { usePWA } from "../hooks/usePWA";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

interface PWAContextType {
  isUpdateAvailable: boolean;
  canInstall: boolean;
  online: boolean;
  handleUpdate: () => Promise<void>;
  handleInstall: () => Promise<boolean>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const usePWAContext = () => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error("usePWAContext must be used within a PWAProvider");
  }
  return context;
};

interface PWAProviderProps {
  children: ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const pwa = usePWA();
  const { online } = useOnlineStatus();

  const value: PWAContextType = {
    ...pwa,
    online,
  };

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
};
