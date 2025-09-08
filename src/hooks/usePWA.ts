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
  checkForUpdates,
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

    // Listen for custom update events
    const handleUpdateAvailable = () => {
      console.log("[PWA] Update available event received");
      setIsUpdateAvailable(true);
    };

    // Check for updates periodically
    const checkForUpdatesPeriodically = async () => {
      if (checkUpdateAvailable()) {
        setIsUpdateAvailable(true);
        setUpdateAvailable(false);
      } else {
        // Also manually check for updates
        await checkForUpdates();
        if (checkUpdateAvailable()) {
          setIsUpdateAvailable(true);
          setUpdateAvailable(false);
        }
      }
    };

    // Listen for custom events
    window.addEventListener("pwa-update-available", handleUpdateAvailable);

    // Check for updates when app becomes visible (user switches back to tab)
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        console.log("[PWA] App became visible, checking for updates...");
        await checkForUpdates();
        if (checkUpdateAvailable()) {
          setIsUpdateAvailable(true);
          setUpdateAvailable(false);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Check for updates every 5 seconds (less frequent but more thorough)
    const interval = setInterval(checkForUpdatesPeriodically, 5000);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("pwa-update-available", handleUpdateAvailable);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
