import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SyncQueueItem {
  id: string;
  type: "create" | "update" | "delete";
  payload: Todo | { id: string };
  timestamp: string;
}

interface TodoDB extends DBSchema {
  todos: {
    key: string;
    value: Todo;
    indexes: { "by-createdAt": string };
  };
  "sync-queue": {
    key: string;
    value: SyncQueueItem;
    indexes: { "by-timestamp": string };
  };
}

let db: IDBPDatabase<TodoDB> | null = null;

export const initDB = async (): Promise<IDBPDatabase<TodoDB>> => {
  if (db) return db;

  db = await openDB<TodoDB>("todo-db", 1, {
    upgrade(db) {
      // Create todos store
      if (!db.objectStoreNames.contains("todos")) {
        const todosStore = db.createObjectStore("todos", { keyPath: "id" });
        todosStore.createIndex("by-createdAt", "createdAt");
      }

      // Create sync queue store
      if (!db.objectStoreNames.contains("sync-queue")) {
        const syncStore = db.createObjectStore("sync-queue", { keyPath: "id" });
        syncStore.createIndex("by-timestamp", "timestamp");
      }
    },
  });

  return db;
};

export const getAllTodos = async (): Promise<Todo[]> => {
  const database = await initDB();
  return await database.getAll("todos");
};

export const addTodo = async (todo: Todo): Promise<void> => {
  const database = await initDB();
  await database.add("todos", todo);
};

export const updateTodo = async (todo: Todo): Promise<void> => {
  const database = await initDB();
  await database.put("todos", todo);
};

export const deleteTodo = async (id: string): Promise<void> => {
  const database = await initDB();
  await database.delete("todos", id);
};

export const bulkPutTodos = async (todos: Todo[]): Promise<void> => {
  const database = await initDB();
  const tx = database.transaction("todos", "readwrite");
  await Promise.all(todos.map((todo) => tx.store.put(todo)));
  await tx.done;
};

// Sync queue operations
export const enqueueMutation = async (item: SyncQueueItem): Promise<void> => {
  const database = await initDB();
  await database.add("sync-queue", item);
};

export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  const database = await initDB();
  return await database.getAll("sync-queue");
};

export const removeSyncQueueItem = async (id: string): Promise<void> => {
  const database = await initDB();
  await database.delete("sync-queue", id);
};

export const clearSyncQueue = async (): Promise<void> => {
  const database = await initDB();
  await database.clear("sync-queue");
};
