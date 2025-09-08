import React, { useState, useEffect } from "react";
import { usePWAContext } from "../context/PWAContext";
import {
  getSWStatus,
  getStorageEstimate,
  checkIndexedDBHealth,
  checkForUpdates,
} from "../services/pwa";

export const PWATestPanel: React.FC = () => {
  const { isUpdateAvailable, canInstall, handleUpdate, handleInstall } =
    usePWAContext();
  const [swStatus, setSwStatus] = useState<string>("Checking...");
  const [storageInfo, setStorageInfo] = useState<string>("Checking...");
  const [dbHealth, setDbHealth] = useState<boolean | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await getSWStatus();
        setSwStatus(status);

        const estimate = await getStorageEstimate();
        if (estimate) {
          const used = Math.round((estimate.usage || 0) / 1024 / 1024);
          const quota = Math.round((estimate.quota || 0) / 1024 / 1024);
          setStorageInfo(`${used}MB / ${quota}MB`);
        } else {
          setStorageInfo("Not available");
        }

        const health = await checkIndexedDBHealth();
        setDbHealth(health);
      } catch (error) {
        console.error("Error checking PWA status:", error);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleForceUpdate = async () => {
    console.log("🔄 Forcing update check...");
    try {
      const hasUpdate = await checkForUpdates();
      if (hasUpdate) {
        console.log("✅ Update found!");
      } else {
        console.log("ℹ️ No updates available");
      }
    } catch (error) {
      console.error("❌ Error checking for updates:", error);
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-3 rounded-full shadow-lg z-50 text-sm font-bold"
        title="Show PWA Test Panel"
      >
        🧪 TEST
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">🧪 PWA Test Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <strong>Service Worker:</strong> {swStatus}
        </div>

        <div>
          <strong>Storage:</strong> {storageInfo}
        </div>

        <div>
          <strong>IndexedDB:</strong>{" "}
          {dbHealth === null
            ? "Checking..."
            : dbHealth
            ? "✅ Healthy"
            : "❌ Issues"}
        </div>

        <div>
          <strong>Update Available:</strong>{" "}
          {isUpdateAvailable ? "✅ Yes" : "❌ No"}
        </div>

        <div>
          <strong>Can Install:</strong> {canInstall ? "✅ Yes" : "❌ No"}
        </div>

        <div className="pt-2 space-y-1">
          <button
            onClick={handleForceUpdate}
            className="w-full bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-xs"
          >
            🔄 Force Update Check
          </button>

          {isUpdateAvailable && (
            <button
              onClick={handleUpdate}
              className="w-full bg-green-500 hover:bg-green-600 px-2 py-1 rounded text-xs"
            >
              ⬆️ Apply Update
            </button>
          )}

          {canInstall && (
            <button
              onClick={handleInstall}
              className="w-full bg-purple-500 hover:bg-purple-600 px-2 py-1 rounded text-xs"
            >
              📱 Install PWA
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
