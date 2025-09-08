import { useState, useEffect } from "react";
import {
  registerSW,
  updateSW,
  isUpdateAvailable as checkUpdateAvailable,
  setUpdateAvailable,
  setInstallPrompt,
  showInstallPrompt,
  setupBackgroundSync,
} from "../services/pwa";

export const usePWA = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Register service worker
    console.log("[PWA] Registering service worker");
    registerSW();

    // Setup background sync and get cleanup function
    console.log("[PWA] Setting up background sync");
    const cleanupBackgroundSync = setupBackgroundSync();

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check for updates periodically
    const checkForUpdates = () => {
      if (checkUpdateAvailable()) {
        setIsUpdateAvailable(true);
        setUpdateAvailable(false);
      }
    };

    const interval = setInterval(checkForUpdates, 1000);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      clearInterval(interval);
      cleanupBackgroundSync();
    };
  }, []);

  const handleUpdate = async () => {
    await updateSW();
    setIsUpdateAvailable(false);
  };

  const handleInstall = async () => {
    const installed = await showInstallPrompt();
    if (installed) {
      setCanInstall(false);
    }
    return installed;
  };

  return {
    isUpdateAvailable,
    canInstall,
    handleUpdate,
    handleInstall,
  };
};
