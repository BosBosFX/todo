import React, { useState } from "react";
import { triggerSync } from "../services/sync";
import { getSyncQueue } from "../services/db";

export const SyncButton: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  // Check queue count periodically
  React.useEffect(() => {
    const checkQueue = async () => {
      const queue = await getSyncQueue();
      setQueueCount(queue.length);
    };

    checkQueue();
    const interval = setInterval(checkQueue, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      await triggerSync();
      // Update queue count after sync
      const queue = await getSyncQueue();
      setQueueCount(queue.length);
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Don't show button if no items to sync
  if (queueCount === 0) return null;

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing}
      className="relative px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      title={`Sync ${queueCount} pending item${queueCount > 1 ? "s" : ""}`}
    >
      {isSyncing ? (
        <>
          <svg
            className="w-4 h-4 mr-2 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Syncing...
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Sync ({queueCount})
        </>
      )}
    </button>
  );
};
