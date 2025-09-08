import type { Todo, SyncQueueItem } from "./db";
import { enqueueMutation, getSyncQueue, removeSyncQueueItem } from "./db";
import * as api from "./api";

export const enqueueCreateTodo = async (
  todo: Omit<Todo, "id" | "createdAt" | "updatedAt">
): Promise<void> => {
  const item: SyncQueueItem = {
    id: Math.random().toString(36).substr(2, 9),
    type: "create",
    payload: todo as Todo,
    timestamp: new Date().toISOString(),
  };
  await enqueueMutation(item);
};

export const enqueueUpdateTodo = async (todo: Todo): Promise<void> => {
  const item: SyncQueueItem = {
    id: Math.random().toString(36).substr(2, 9),
    type: "update",
    payload: todo,
    timestamp: new Date().toISOString(),
  };
  await enqueueMutation(item);
};

export const enqueueDeleteTodo = async (id: string): Promise<void> => {
  const item: SyncQueueItem = {
    id: Math.random().toString(36).substr(2, 9),
    type: "delete",
    payload: { id },
    timestamp: new Date().toISOString(),
  };
  await enqueueMutation(item);
};

export const flushQueue = async (): Promise<void> => {
  if (!navigator.onLine) {
    console.log("[Sync] Offline - skipping queue flush");
    return;
  }

  const queue = await getSyncQueue();
  if (queue.length === 0) {
    console.log("[Sync] No items in queue");
    return;
  }

  console.log(`[Sync] Flushing ${queue.length} items from queue`);

  const successfulItems: string[] = [];

  for (const item of queue) {
    try {
      switch (item.type) {
        case "create":
          await api.createTodo(
            item.payload as Omit<Todo, "id" | "createdAt" | "updatedAt">
          );
          break;
        case "update":
          await api.updateTodo(item.payload as Todo);
          break;
        case "delete":
          await api.deleteTodo((item.payload as { id: string }).id);
          break;
      }
      successfulItems.push(item.id);
      console.log(
        `[Sync] Successfully synced ${item.type} operation for item ${item.id}`
      );
    } catch (error) {
      console.error(
        `[Sync] Failed to sync ${item.type} operation for item ${item.id}:`,
        error
      );
      // Continue with other items even if one fails
    }
  }

  // Remove successfully synced items from queue
  for (const itemId of successfulItems) {
    await removeSyncQueueItem(itemId);
  }

  console.log(
    `[Sync] Queue flush completed. ${successfulItems.length}/${queue.length} items synced`
  );
};

export const attachOnlineListener = (): (() => void) => {
  const handleOnline = () => {
    console.log("[Sync] Network is back online, flushing queue");
    flushQueue();
  };

  window.addEventListener("online", handleOnline);

  // Return cleanup function
  return () => {
    window.removeEventListener("online", handleOnline);
  };
};

// Request background sync if supported
export const requestBackgroundSync = async (): Promise<void> => {
  if (
    "serviceWorker" in navigator &&
    "sync" in window.ServiceWorkerRegistration.prototype
  ) {
    try {
      const registration = await navigator.serviceWorker.ready;
      // @ts-ignore - sync API may not be available in all browsers
      await registration.sync.register("todos-sync");
      console.log("[Sync] Background sync registered");
    } catch (error) {
      console.error("[Sync] Failed to register background sync:", error);
    }
  } else {
    console.log(
      "[Sync] Background sync not supported, using online event fallback"
    );
  }
};
