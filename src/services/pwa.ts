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

// Install prompt handling
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
      if (event.data && event.data.type === "SYNC_TODOS") {
        console.log("[PWA] Background sync triggered");
        // Import sync service dynamically to avoid circular dependencies
        import("./sync").then(({ flushQueue }) => {
          flushQueue();
        });
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
