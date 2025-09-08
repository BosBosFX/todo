import { useState, useEffect, useCallback } from "react";
import type { Todo } from "../services/db";
import {
  getAllTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  bulkPutTodos,
} from "../services/db";
import * as api from "../services/api";
import {
  enqueueCreateTodo,
  enqueueUpdateTodo,
  enqueueDeleteTodo,
  requestBackgroundSync,
} from "../services/sync";

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from API first
      try {
        console.log("[Todos] Attempting to fetch from API...");
        const apiTodos = await api.fetchTodos();
        await bulkPutTodos(apiTodos);
        setTodos(apiTodos);
        console.log("[Todos] Loaded from API and cached to IndexedDB");
      } catch (apiError) {
        // If API fails, load from IndexedDB
        console.log("[Todos] API failed, falling back to IndexedDB:", apiError);
        const localTodos = await getAllTodos();
        setTodos(localTodos);
        console.log("[Todos] Loaded from IndexedDB (offline)");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load todos");
      console.error("[Todos] Error loading todos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTodo = useCallback(async (title: string) => {
    try {
      const newTodo: Todo = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to local storage immediately (optimistic update)
      await addTodo(newTodo);
      setTodos((prev) => [...prev, newTodo]);

      // Enqueue for sync with local ID
      await enqueueCreateTodo(newTodo, newTodo.id);

      // Try to sync immediately if online
      if (navigator.onLine) {
        try {
          await api.createTodo(newTodo);
          console.log("[Todos] Todo created and synced to API");
        } catch (syncError) {
          console.log("[Todos] Todo created locally, will sync when online");
          await requestBackgroundSync();
        }
      } else {
        console.log("[Todos] Todo created locally, will sync when online");
        await requestBackgroundSync();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create todo");
      console.error("[Todos] Error creating todo:", err);
    }
  }, []);

  const toggleTodo = useCallback(
    async (id: string) => {
      try {
        const todo = todos.find((t) => t.id === id);
        if (!todo) return;

        const updatedTodo: Todo = {
          ...todo,
          completed: !todo.completed,
          updatedAt: new Date().toISOString(),
        };

        // Update local storage immediately (optimistic update)
        await updateTodo(updatedTodo);
        setTodos((prev) => prev.map((t) => (t.id === id ? updatedTodo : t)));

        // Enqueue for sync
        await enqueueUpdateTodo(updatedTodo);

        // Try to sync immediately if online
        if (navigator.onLine) {
          try {
            await api.updateTodo(updatedTodo);
            console.log("[Todos] Todo updated and synced to API");
          } catch (syncError) {
            console.log("[Todos] Todo updated locally, will sync when online");
            await requestBackgroundSync();
          }
        } else {
          console.log("[Todos] Todo updated locally, will sync when online");
          await requestBackgroundSync();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update todo");
        console.error("[Todos] Error updating todo:", err);
      }
    },
    [todos]
  );

  const removeTodo = useCallback(async (id: string) => {
    try {
      // Remove from local storage immediately (optimistic update)
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));

      // Enqueue for sync
      await enqueueDeleteTodo(id);

      // Try to sync immediately if online
      if (navigator.onLine) {
        try {
          await api.deleteTodo(id);
          console.log("[Todos] Todo deleted and synced to API");
        } catch (syncError) {
          console.log("[Todos] Todo deleted locally, will sync when online");
          await requestBackgroundSync();
        }
      } else {
        console.log("[Todos] Todo deleted locally, will sync when online");
        await requestBackgroundSync();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete todo");
      console.error("[Todos] Error deleting todo:", err);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // Listen for sync completion and refresh todos
  useEffect(() => {
    const handleSyncComplete = () => {
      console.log("[Todos] Sync completed, refreshing todos");
      loadTodos();
    };

    window.addEventListener("sync-complete", handleSyncComplete);

    return () => {
      window.removeEventListener("sync-complete", handleSyncComplete);
    };
  }, [loadTodos]);

  return {
    todos,
    loading,
    error,
    createTodo,
    toggleTodo,
    removeTodo,
    refresh: loadTodos,
  };
};
