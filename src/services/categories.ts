import type { Category } from "../types/category";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// Simulate network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulate network failure when offline
const simulateNetworkCall = async <T>(fn: () => Promise<T>): Promise<T> => {
  if (!navigator.onLine) {
    console.log("[Categories API] Network is offline, throwing error");
    throw new Error("Network unavailable");
  }

  console.log("[Categories API] Network is online, proceeding with request");

  // Simulate network latency
  await delay(Math.random() * 1000 + 500);

  // Simulate occasional network failures (10% chance)
  if (Math.random() < 0.1) {
    console.log("[Categories API] Simulated network failure");
    throw new Error("Network request failed");
  }

  return fn();
};

export const fetchCategories = async (): Promise<Category[]> => {
  return simulateNetworkCall(async () => {
    console.log(
      `[Categories API] Fetching categories from ${API_BASE_URL}/categories/minimal`
    );

    const response = await fetch(`${API_BASE_URL}/categories/minimal`, {
      method: "GET",
      headers: {
        accept: "*/*",
        Authorization: "Bearer simple-token",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const categories = await response.json();
    console.log(`[Categories API] Fetched ${categories.length} categories`);
    return categories;
  });
};

// Utility function to test offline behavior
export const testCategoriesOfflineBehavior = async (): Promise<void> => {
  console.log("=== Testing Categories Offline Behavior ===");
  console.log(
    "Current network status:",
    navigator.onLine ? "Online" : "Offline"
  );

  try {
    console.log("Attempting to fetch categories...");
    const categories = await fetchCategories();
    console.log(
      "✅ Categories API call succeeded, got categories:",
      categories.length
    );
  } catch (error) {
    console.log(
      "❌ Categories API call failed as expected:",
      error instanceof Error ? error.message : String(error)
    );
  }
};
