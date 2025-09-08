import type { Todo } from "./db";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Simulate network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulate network failure when offline
const simulateNetworkCall = async <T>(fn: () => Promise<T>): Promise<T> => {
  if (!navigator.onLine) {
    console.log("[API] Network is offline, throwing error");
    throw new Error("Network unavailable");
  }

  console.log("[API] Network is online, proceeding with request");

  // Simulate network latency
  await delay(Math.random() * 1000 + 500);

  // Simulate occasional network failures (10% chance)
  if (Math.random() < 0.1) {
    console.log("[API] Simulated network failure");
    throw new Error("Network request failed");
  }

  return fn();
};

export const fetchTodos = async (): Promise<Todo[]> => {
  return simulateNetworkCall(async () => {
    // Simulate a real API call that would fail when offline
    console.log(`[API] Fetching todos from ${API_BASE_URL}/todos`);

    // Simulate API response - only return mock data when online
    const mockTodos: Todo[] = [
      {
        id: "1",
        title: "Welcome to your Todo PWA!",
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        title: "This works offline too!",
        completed: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    return mockTodos;
  });
};

export const createTodo = async (
  todo: Omit<Todo, "id" | "createdAt" | "updatedAt">
): Promise<Todo> => {
  return simulateNetworkCall(async () => {
    const newTodo: Todo = {
      ...todo,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log(`[API] Creating todo at ${API_BASE_URL}/todos`, newTodo);
    return newTodo;
  });
};

export const updateTodo = async (todo: Todo): Promise<Todo> => {
  return simulateNetworkCall(async () => {
    const updatedTodo: Todo = {
      ...todo,
      updatedAt: new Date().toISOString(),
    };

    console.log(
      `[API] Updating todo at ${API_BASE_URL}/todos/${todo.id}`,
      updatedTodo
    );
    return updatedTodo;
  });
};

export const deleteTodo = async (id: string): Promise<void> => {
  return simulateNetworkCall(async () => {
    console.log(`[API] Deleting todo at ${API_BASE_URL}/todos/${id}`);
  });
};

// Utility function to test offline behavior
export const testOfflineBehavior = async (): Promise<void> => {
  console.log("=== Testing Offline Behavior ===");
  console.log(
    "Current network status:",
    navigator.onLine ? "Online" : "Offline"
  );

  try {
    console.log("Attempting to fetch todos...");
    const todos = await fetchTodos();
    console.log("✅ API call succeeded, got todos:", todos.length);
  } catch (error) {
    console.log(
      "❌ API call failed as expected:",
      error instanceof Error ? error.message : String(error)
    );
  }
};
