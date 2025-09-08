import type { Todo, SyncQueueItem } from "./db";
import { enqueueMutation, getSyncQueue, removeSyncQueueItem } from "./db";
import * as api from "./api";

export const enqueueCreateTodo = async (
  todo: Omit<Todo, "id" | "createdAt" | "updatedAt">,
  localId?: string
): Promise<void> => {
  const item: SyncQueueItem = {
    id: Math.random().toString(36).substr(2, 9),
    type: "create",
    payload: todo as Todo,
    timestamp: new Date().toISOString(),
    localId,
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
  const syncedTodos: Todo[] = [];

  for (const item of queue) {
    try {
      let syncedTodo: Todo | null = null;

      switch (item.type) {
        case "create":
          syncedTodo = await api.createTodo(
            item.payload as Omit<Todo, "id" | "createdAt" | "updatedAt">
          );
          break;
        case "update":
          syncedTodo = await api.updateTodo(item.payload as Todo);
          break;
        case "delete":
          await api.deleteTodo((item.payload as { id: string }).id);
          break;
      }

      if (syncedTodo) {
        syncedTodos.push(syncedTodo);
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

  // Update local IndexedDB with synced data
  if (syncedTodos.length > 0) {
    const { updateTodo, deleteTodo } = await import("./db");

    // Update each synced todo in local IndexedDB
    for (let i = 0; i < syncedTodos.length; i++) {
      const syncedTodo = syncedTodos[i];
      const originalItem = queue.find((item) =>
        successfulItems.includes(item.id)
      );

      if (
        originalItem &&
        originalItem.type === "create" &&
        originalItem.localId
      ) {
        // For created todos, we need to replace the local todo with the server version
        if (originalItem.localId !== syncedTodo.id) {
          // Delete the local todo with the old ID
          await deleteTodo(originalItem.localId);
          console.log(
            `[Sync] Deleted local todo with ID ${originalItem.localId}`
          );
        }
      }

      // Add/update with the server version
      await updateTodo(syncedTodo);
    }

    console.log(
      `[Sync] Updated local IndexedDB with ${syncedTodos.length} synced todos`
    );
  }

  // Remove successfully synced items from queue
  for (const itemId of successfulItems) {
    await removeSyncQueueItem(itemId);
  }

  console.log(
    `[Sync] Queue flush completed. ${successfulItems.length}/${queue.length} items synced`
  );

  // Notify that sync is complete
  window.dispatchEvent(
    new CustomEvent("sync-complete", {
      detail: { syncedCount: successfulItems.length, totalCount: queue.length },
    })
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

// Manual sync trigger - can be called when user comes back online
export const triggerSync = async (): Promise<void> => {
  console.log("[Sync] Manual sync triggered");
  await flushQueue();
};
