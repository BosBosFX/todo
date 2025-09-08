import React, { useState, useEffect } from "react";
import { usePWAContext } from "../context/PWAContext";
import { getSWStatus } from "../services/pwa";
import { testOfflineBehavior } from "../services/api";

export const About: React.FC = () => {
  const { online } = usePWAContext();
  const [swStatus, setSwStatus] = useState<string>("Checking...");

  useEffect(() => {
    const checkStatus = async () => {
      const status = await getSWStatus();
      setSwStatus(status);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">About Todo PWA</h1>

      <div className="prose max-w-none">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <strong>Offline-First:</strong> Works completely offline with
              IndexedDB storage
            </li>
            <li className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <strong>Background Sync:</strong> Automatically syncs changes when
              back online
            </li>
            <li className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <strong>Installable:</strong> Can be installed as a native app
            </li>
            <li className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <strong>Update Notifications:</strong> Notifies when new versions
              are available
            </li>
            <li className="flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <strong>Connection Awareness:</strong> Shows online/offline status
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tech Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Frontend</h3>
              <ul className="space-y-1">
                <li>• React 18 + TypeScript</li>
                <li>• Vite (build tool)</li>
                <li>• React Router</li>
                <li>• Tailwind CSS</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">PWA Features</h3>
              <ul className="space-y-1">
                <li>• vite-plugin-pwa</li>
                <li>• IndexedDB (idb)</li>
                <li>• Workbox</li>
                <li>• Service Worker</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Current Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  online
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    online ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                {online ? "Online" : "Offline"}
              </div>
              <span className="text-gray-600">
                {online
                  ? "Connected to the internet"
                  : "Working in offline mode"}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <div className="w-2 h-2 rounded-full mr-2 bg-blue-500" />
                Service Worker
              </div>
              <span className="text-gray-600">{swStatus}</span>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={testOfflineBehavior}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
            >
              Test Offline Behavior
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Click this button and check the browser console to see how the app
              handles offline scenarios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
