import React from "react";
import { usePWAContext } from "../context/PWAContext";

export const UpdateToast: React.FC = () => {
  const { isUpdateAvailable, handleUpdate } = usePWAContext();

  if (!isUpdateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-4 z-50">
      <div className="flex-1">
        <p className="font-medium">Update Available</p>
        <p className="text-sm opacity-90">A new version is ready to install.</p>
      </div>
      <button
        onClick={handleUpdate}
        className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition-colors"
      >
        Reload
      </button>
    </div>
  );
};
