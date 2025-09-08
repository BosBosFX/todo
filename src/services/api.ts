import type { Todo } from "./db";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// In-memory database simulation
class MockDatabase {
  private todos: Todo[] = [
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

  async getAllTodos(): Promise<Todo[]> {
    console.log(`[MockDB] Fetching ${this.todos.length} todos`);
    return [...this.todos]; // Return a copy
  }

  async createTodo(
    todo: Omit<Todo, "id" | "createdAt" | "updatedAt">
  ): Promise<Todo> {
    const newTodo: Todo = {
      ...todo,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.todos.push(newTodo);
    console.log(`[MockDB] Created todo:`, newTodo);
    return newTodo;
  }

  async updateTodo(todo: Todo): Promise<Todo> {
    const index = this.todos.findIndex((t) => t.id === todo.id);
    if (index === -1) {
      throw new Error(`Todo with id ${todo.id} not found`);
    }

    const updatedTodo: Todo = {
      ...todo,
      updatedAt: new Date().toISOString(),
    };

    this.todos[index] = updatedTodo;
    console.log(`[MockDB] Updated todo:`, updatedTodo);
    return updatedTodo;
  }

  async deleteTodo(id: string): Promise<void> {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Todo with id ${id} not found`);
    }

    const deletedTodo = this.todos.splice(index, 1)[0];
    console.log(`[MockDB] Deleted todo:`, deletedTodo);
  }

  // Utility method to get current state
  getState(): { todos: Todo[] } {
    return { todos: [...this.todos] };
  }

  // Utility method to reset database
  reset(): void {
    this.todos = [
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
    console.log("[MockDB] Database reset to initial state");
  }
}

// Create a singleton instance
const mockDB = new MockDatabase();

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
    console.log(`[API] Fetching todos from ${API_BASE_URL}/todos`);
    return await mockDB.getAllTodos();
  });
};

export const createTodo = async (
  todo: Omit<Todo, "id" | "createdAt" | "updatedAt">
): Promise<Todo> => {
  return simulateNetworkCall(async () => {
    console.log(`[API] Creating todo at ${API_BASE_URL}/todos`);
    return await mockDB.createTodo(todo);
  });
};

export const updateTodo = async (todo: Todo): Promise<Todo> => {
  return simulateNetworkCall(async () => {
    console.log(`[API] Updating todo at ${API_BASE_URL}/todos/${todo.id}`);
    return await mockDB.updateTodo(todo);
  });
};

export const deleteTodo = async (id: string): Promise<void> => {
  return simulateNetworkCall(async () => {
    console.log(`[API] Deleting todo at ${API_BASE_URL}/todos/${id}`);
    await mockDB.deleteTodo(id);
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

// Utility functions for testing and debugging
export const getMockDBState = (): { todos: Todo[] } => {
  return mockDB.getState();
};

export const resetMockDB = (): void => {
  mockDB.reset();
};

export const addTestTodo = async (): Promise<void> => {
  try {
    const testTodo = {
      title: `Test Todo ${Date.now()}`,
      completed: false,
    };
    await mockDB.createTodo(testTodo);
    console.log("✅ Test todo added to mock database");
  } catch (error) {
    console.error("❌ Failed to add test todo:", error);
  }
};
