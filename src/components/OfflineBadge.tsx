import React from "react";
import { usePWAContext } from "../context/PWAContext";

export const OfflineBadge: React.FC = () => {
  const { online } = usePWAContext();

  return (
    <div
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        online ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full mr-1 ${
          online ? "bg-green-500" : "bg-red-500"
        }`}
      />
      {online ? "Online" : "Offline"}
    </div>
  );
};
