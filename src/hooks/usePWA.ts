import { useState, useEffect } from "react";
import {
  registerSW,
  updateSW,
  isUpdateAvailable as checkUpdateAvailable,
  setUpdateAvailable,
  setInstallPrompt,
  showInstallPrompt,
  setupBackgroundSync,
  checkIndexedDBHealth,
  getStorageEstimate,
} from "../services/pwa";
import { attachOnlineListener } from "../services/sync";

export const usePWA = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const initializeStorage = async () => {
      // Check storage health
      const isHealthy = await checkIndexedDBHealth();
      if (!isHealthy) {
        console.error("IndexedDB is not functioning properly");
      }

      // Monitor storage usage
      const estimate = await getStorageEstimate();
      if (
        estimate &&
        estimate.usage &&
        estimate.quota &&
        estimate.usage > estimate.quota * 0.8
      ) {
        console.error("Storage is almost full");
      }
    };

    initializeStorage();
  }, []);

  useEffect(() => {
    // Register service worker
    console.log("[PWA] Registering service worker");
    registerSW();

    // Setup background sync and get cleanup function
    console.log("[PWA] Setting up background sync");
    const cleanupBackgroundSync = setupBackgroundSync();

    // Setup online listener for sync
    console.log("[PWA] Setting up online listener for sync");
    const cleanupOnlineListener = attachOnlineListener();

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
      cleanupOnlineListener();
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
