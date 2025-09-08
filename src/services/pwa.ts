import { Workbox } from "workbox-window";

let workbox: Workbox | null = null;
let updateAvailable = false;
let installPrompt: any = null;
let isRegistering = false;

export const registerSW = async (): Promise<void> => {
  if ("serviceWorker" in navigator && !workbox && !isRegistering) {
    isRegistering = true;
    try {
      // Check if service worker is already registered
      const registration = await navigator.serviceWorker.getRegistration(
        "/sw.js"
      );
      if (registration) {
        console.log("[PWA] Service worker already registered");
        workbox = new Workbox("/sw.js");
        workbox.addEventListener("waiting", () => {
          updateAvailable = true;
          console.log("[PWA] Update available");
        });
        workbox.addEventListener("controlling", () => {
          window.location.reload();
        });
        isRegistering = false;
        return;
      }

      workbox = new Workbox("/sw.js");

      workbox.addEventListener("waiting", () => {
        updateAvailable = true;
        console.log("[PWA] Update available");
      });

      workbox.addEventListener("controlling", () => {
        window.location.reload();
      });

      await workbox.register();
      console.log("[PWA] Service worker registered");
    } catch (error) {
      console.error("[PWA] Service worker registration failed:", error);
      workbox = null;
    } finally {
      isRegistering = false;
    }
  }
};

export const updateSW = async (): Promise<void> => {
  if (workbox) {
    await workbox.update();
  }
};

export const getSWStatus = async (): Promise<string> => {
  if (!("serviceWorker" in navigator)) {
    return "Service Worker not supported";
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration(
      "/sw.js"
    );
    if (!registration) {
      return "No service worker registered";
    }

    if (registration.active) {
      return "Service worker active";
    } else if (registration.installing) {
      return "Service worker installing";
    } else if (registration.waiting) {
      return "Service worker waiting";
    }

    return "Service worker state unknown";
  } catch (error) {
    return `Error checking service worker: ${error}`;
  }
};

export const isUpdateAvailable = (): boolean => {
  return updateAvailable;
};

export const setUpdateAvailable = (available: boolean): void => {
  updateAvailable = available;
};

export const setInstallPrompt = (prompt: any): void => {
  installPrompt = prompt;
};

export const getInstallPrompt = (): any => {
  return installPrompt;
};

export const showInstallPrompt = async (): Promise<boolean> => {
  if (installPrompt) {
    const result = await installPrompt.prompt();
    installPrompt = null;
    return result.outcome === "accepted";
  }
  return false;
};

// Background sync event listener for service worker
let backgroundSyncHandler: ((event: MessageEvent) => void) | null = null;

export const setupBackgroundSync = (): (() => void) => {
  if ("serviceWorker" in navigator && !backgroundSyncHandler) {
    backgroundSyncHandler = (event: MessageEvent) => {
      // Handle background sync
      if (event.data && event.data.type === "SYNC_TODOS") {
        console.log("[PWA] Background sync triggered");
        // Import sync service dynamically to avoid circular dependencies
        import("./sync").then(({ flushQueue }) => {
          flushQueue();
        });
      }

      // Handle cache updates
      if (event.data && event.data.type === "CACHE_UPDATED") {
        console.log("[PWA] Cache updated, checking for app updates");
        // Trigger update check
        updateSW();
      }

      // Handle service worker errors
      if (event.data && event.data.type === "SW_ERROR") {
        console.error("[PWA] Service worker error:", event.data.error);
      }
    };

    navigator.serviceWorker.addEventListener("message", backgroundSyncHandler);

    // Return cleanup function
    return () => {
      if (backgroundSyncHandler) {
        navigator.serviceWorker.removeEventListener(
          "message",
          backgroundSyncHandler
        );
        backgroundSyncHandler = null;
      }
    };
  }

  return () => {}; // Return empty cleanup function if already set up
};

export const getStorageEstimate = async (): Promise<StorageEstimate | null> => {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      console.log("Storage estimate:", {
        quota: estimate.quota ?? 0,
        usage: estimate.usage ?? 0,
        available: (estimate.quota ?? 0) - (estimate.usage ?? 0),
      });
      return estimate;
    } catch (error) {
      console.error("Error getting storage estimate:", error);
      return null as unknown as StorageEstimate;
    }
  }
  return null;
};

export const checkIndexedDBHealth = async (): Promise<boolean> => {
  try {
    // Test IndexedDB connection
    const testDB = indexedDB.open("health-check", 1);

    return new Promise((resolve, _reject) => {
      testDB.onerror = () => {
        console.error("IndexedDB health check failed");
        resolve(false);
      };

      testDB.onsuccess = () => {
        console.log("IndexedDB health check passed");
        testDB.result.close();
        indexedDB.deleteDatabase("health-check");
        resolve(true);
      };

      testDB.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore("test");
      };
    });
  } catch (error) {
    console.error("IndexedDB health check error:", error);
    return false;
  }
};
