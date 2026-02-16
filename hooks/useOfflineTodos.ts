import { Doc, Id } from "@/convex/_generated/dataModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const LOCAL_TODOS_KEY = "@todo_app:local_todos";
const PENDING_TODO_OPS_KEY = "@todo_app:pending_todo_ops";

export type TodoItem = {
  _id: string;
  _creationTime: number;
  text: string;
  isCompleted: boolean;
  category?: string;
  priority?: string;
};

type AddInput = {
  text: string;
  category: string;
  priority: "High" | "Medium" | "Low";
};

type UpdateInput = AddInput & { id: string };

type PendingTodoOperation =
  | ({ type: "add"; localId: string; isCompleted: boolean } & AddInput)
  | ({ type: "update"; id: string } & AddInput)
  | { type: "toggle"; id: string }
  | { type: "delete"; id: string };

type UseOfflineTodosArgs = {
  remoteTodos: Doc<"todos">[] | undefined;
  isOnline: boolean;
  isAutoSyncEnabled: boolean;
  startSync: () => void;
  finishSync: () => void;
  errorSync: () => void;
  addTodoRemote: (args: AddInput) => Promise<Id<"todos">>;
  updateTodoRemote: (args: {
    id: Id<"todos">;
    text: string;
    category: string;
    priority: string;
  }) => Promise<void>;
  toggleTodoRemote: (args: { id: Id<"todos"> }) => Promise<void>;
  deleteTodoRemote: (args: { id: Id<"todos"> }) => Promise<void>;
};

const isLocalId = (id: string) => id.startsWith("local:");

const createLocalId = () =>
  `local:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

const toTodoItem = (todo: Doc<"todos">): TodoItem => ({
  _id: String(todo._id),
  _creationTime: todo._creationTime,
  text: todo.text,
  isCompleted: todo.isCompleted,
  category: todo.category,
  priority: todo.priority,
});

const enqueueUpdate = (ops: PendingTodoOperation[], input: UpdateInput) => {
  const addIndex = ops.findIndex(
    (op) => op.type === "add" && op.localId === input.id,
  );

  if (addIndex >= 0) {
    const next = [...ops];
    const addOp = next[addIndex] as Extract<PendingTodoOperation, { type: "add" }>;
    next[addIndex] = {
      ...addOp,
      text: input.text,
      category: input.category,
      priority: input.priority,
    };
    return next;
  }

  const filtered = ops.filter(
    (op) => !(op.type === "update" && op.id === input.id),
  );
  filtered.push({
    type: "update",
    id: input.id,
    text: input.text,
    category: input.category,
    priority: input.priority,
  });
  return filtered;
};

const enqueueToggle = (ops: PendingTodoOperation[], id: string) => {
  const addIndex = ops.findIndex((op) => op.type === "add" && op.localId === id);

  if (addIndex >= 0) {
    const next = [...ops];
    const addOp = next[addIndex] as Extract<PendingTodoOperation, { type: "add" }>;
    next[addIndex] = { ...addOp, isCompleted: !addOp.isCompleted };
    return next;
  }

  const last = ops[ops.length - 1];
  if (last?.type === "toggle" && last.id === id) {
    return ops.slice(0, -1);
  }

  return [...ops, { type: "toggle", id }];
};

const enqueueDelete = (ops: PendingTodoOperation[], id: string) => {
  const addIndex = ops.findIndex((op) => op.type === "add" && op.localId === id);

  if (addIndex >= 0) {
    return ops.filter((op) => !(op.type === "add" && op.localId === id));
  }

  const withoutPriorOps = ops.filter((op) => {
    if (op.type === "update" || op.type === "toggle" || op.type === "delete") {
      return op.id !== id;
    }
    return true;
  });

  return [...withoutPriorOps, { type: "delete", id }];
};

export function useOfflineTodos({
  remoteTodos,
  isOnline,
  isAutoSyncEnabled,
  startSync,
  finishSync,
  errorSync,
  addTodoRemote,
  updateTodoRemote,
  toggleTodoRemote,
  deleteTodoRemote,
}: UseOfflineTodosArgs) {
  const [localTodos, setLocalTodos] = useState<TodoItem[]>([]);
  const [pendingOps, setPendingOps] = useState<PendingTodoOperation[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const localTodosRef = useRef<TodoItem[]>([]);
  const pendingOpsRef = useRef<PendingTodoOperation[]>([]);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    localTodosRef.current = localTodos;
  }, [localTodos]);

  useEffect(() => {
    pendingOpsRef.current = pendingOps;
  }, [pendingOps]);

  useEffect(() => {
    let mounted = true;

    const loadLocalState = async () => {
      try {
        const [todosRaw, opsRaw] = await Promise.all([
          AsyncStorage.getItem(LOCAL_TODOS_KEY),
          AsyncStorage.getItem(PENDING_TODO_OPS_KEY),
        ]);

        if (!mounted) return;

        const parsedTodos = todosRaw
          ? (JSON.parse(todosRaw) as TodoItem[])
          : [];
        const parsedOps = opsRaw
          ? (JSON.parse(opsRaw) as PendingTodoOperation[])
          : [];

        setLocalTodos(Array.isArray(parsedTodos) ? parsedTodos : []);
        setPendingOps(Array.isArray(parsedOps) ? parsedOps : []);
      } catch (error) {
        console.error("Failed to hydrate offline todos:", error);
        if (mounted) {
          setLocalTodos([]);
          setPendingOps([]);
        }
      } finally {
        if (mounted) {
          setIsHydrated(true);
        }
      }
    };

    loadLocalState();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    AsyncStorage.setItem(LOCAL_TODOS_KEY, JSON.stringify(localTodos)).catch(
      (error) => {
        console.error("Failed to persist local todos:", error);
      },
    );
  }, [isHydrated, localTodos]);

  useEffect(() => {
    if (!isHydrated) return;
    AsyncStorage.setItem(PENDING_TODO_OPS_KEY, JSON.stringify(pendingOps)).catch(
      (error) => {
        console.error("Failed to persist pending todo ops:", error);
      },
    );
  }, [isHydrated, pendingOps]);

  const remoteTodoItems = useMemo(
    () => (remoteTodos ? remoteTodos.map(toTodoItem) : []),
    [remoteTodos],
  );

  useEffect(() => {
    if (!isHydrated || !isOnline || remoteTodos === undefined) {
      return;
    }

    // Keep optimistic local state while there are pending offline operations.
    if (pendingOps.length > 0) {
      return;
    }

    setLocalTodos(remoteTodoItems);
  }, [isHydrated, isOnline, remoteTodos, remoteTodoItems, pendingOps.length]);

  const syncPendingChanges = useCallback(async () => {
    if (!isOnline || isSyncingRef.current) return;
    if (pendingOpsRef.current.length === 0) return;

    isSyncingRef.current = true;
    startSync();

    const idMap: Record<string, string> = {};
    let workingTodos = [...localTodosRef.current];
    const currentOps = [...pendingOpsRef.current];

    try {
      for (let i = 0; i < currentOps.length; i += 1) {
        const op = currentOps[i];

        if (op.type === "add") {
          const serverId = await addTodoRemote({
            text: op.text,
            category: op.category,
            priority: op.priority,
          });
          const serverIdString = String(serverId);

          if (op.isCompleted) {
            await toggleTodoRemote({ id: serverId });
          }

          idMap[op.localId] = serverIdString;
          workingTodos = workingTodos.map((todo) =>
            todo._id === op.localId ? { ...todo, _id: serverIdString } : todo,
          );
          continue;
        }

        const resolvedId = idMap[op.id] ?? op.id;
        if (isLocalId(resolvedId)) {
          continue;
        }

        if (op.type === "update") {
          await updateTodoRemote({
            id: resolvedId as Id<"todos">,
            text: op.text,
            category: op.category,
            priority: op.priority,
          });
          continue;
        }

        if (op.type === "toggle") {
          await toggleTodoRemote({ id: resolvedId as Id<"todos"> });
          continue;
        }

        if (op.type === "delete") {
          await deleteTodoRemote({ id: resolvedId as Id<"todos"> });
          workingTodos = workingTodos.filter((todo) => todo._id !== op.id);
        }
      }

      setLocalTodos(workingTodos);
      setPendingOps([]);
      finishSync();
    } catch (error) {
      console.error("Failed to sync pending todos:", error);
      errorSync();
    } finally {
      isSyncingRef.current = false;
    }
  }, [
    addTodoRemote,
    deleteTodoRemote,
    errorSync,
    finishSync,
    isOnline,
    startSync,
    toggleTodoRemote,
    updateTodoRemote,
  ]);

  useEffect(() => {
    if (!isHydrated || !isOnline || !isAutoSyncEnabled) return;
    if (pendingOps.length === 0) return;
    void syncPendingChanges();
  }, [
    isAutoSyncEnabled,
    isHydrated,
    isOnline,
    pendingOps.length,
    syncPendingChanges,
  ]);

  const queueAddLocally = useCallback(
    (input: AddInput) => {
      const localId = createLocalId();
      const newTodo: TodoItem = {
        _id: localId,
        _creationTime: Date.now(),
        text: input.text,
        isCompleted: false,
        category: input.category,
        priority: input.priority,
      };

      setLocalTodos((prev) => [newTodo, ...prev]);
      setPendingOps((prev) => [
        ...prev,
        {
          type: "add",
          localId,
          text: input.text,
          category: input.category,
          priority: input.priority,
          isCompleted: false,
        },
      ]);
      errorSync();
    },
    [errorSync],
  );

  const addTodo = useCallback(
    async (input: AddInput) => {
      const shouldQueue = !isOnline || pendingOpsRef.current.length > 0;
      if (shouldQueue) {
        queueAddLocally(input);
        return;
      }

      try {
        if (isAutoSyncEnabled) startSync();
        await addTodoRemote(input);
        if (isAutoSyncEnabled) finishSync();
      } catch (error) {
        console.error("Add todo failed, queueing locally:", error);
        queueAddLocally(input);
      }
    },
    [
      addTodoRemote,
      finishSync,
      isAutoSyncEnabled,
      isOnline,
      queueAddLocally,
      startSync,
    ],
  );

  const queueUpdateLocally = useCallback(
    (input: UpdateInput) => {
      setLocalTodos((prev) =>
        prev.map((todo) =>
          todo._id === input.id
            ? {
                ...todo,
                text: input.text,
                category: input.category,
                priority: input.priority,
              }
            : todo,
        ),
      );
      setPendingOps((prev) => enqueueUpdate(prev, input));
      errorSync();
    },
    [errorSync],
  );

  const updateTodo = useCallback(
    async (input: UpdateInput) => {
      const shouldQueue = !isOnline || pendingOpsRef.current.length > 0;
      if (shouldQueue) {
        queueUpdateLocally(input);
        return;
      }

      try {
        if (isAutoSyncEnabled) startSync();
        await updateTodoRemote({
          id: input.id as Id<"todos">,
          text: input.text,
          category: input.category,
          priority: input.priority,
        });
        if (isAutoSyncEnabled) finishSync();
      } catch (error) {
        console.error("Update todo failed, queueing locally:", error);
        queueUpdateLocally(input);
      }
    },
    [
      finishSync,
      isAutoSyncEnabled,
      isOnline,
      queueUpdateLocally,
      startSync,
      updateTodoRemote,
    ],
  );

  const queueToggleLocally = useCallback(
    (id: string) => {
      setLocalTodos((prev) =>
        prev.map((todo) =>
          todo._id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo,
        ),
      );
      setPendingOps((prev) => enqueueToggle(prev, id));
      errorSync();
    },
    [errorSync],
  );

  const toggleTodo = useCallback(
    async (id: string) => {
      const shouldQueue = !isOnline || pendingOpsRef.current.length > 0;
      if (shouldQueue) {
        queueToggleLocally(id);
        return;
      }

      try {
        if (isAutoSyncEnabled) startSync();
        await toggleTodoRemote({ id: id as Id<"todos"> });
        if (isAutoSyncEnabled) finishSync();
      } catch (error) {
        console.error("Toggle todo failed, queueing locally:", error);
        queueToggleLocally(id);
      }
    },
    [
      finishSync,
      isAutoSyncEnabled,
      isOnline,
      queueToggleLocally,
      startSync,
      toggleTodoRemote,
    ],
  );

  const queueDeleteLocally = useCallback(
    (id: string) => {
      setLocalTodos((prev) => prev.filter((todo) => todo._id !== id));
      setPendingOps((prev) => enqueueDelete(prev, id));
      errorSync();
    },
    [errorSync],
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      const shouldQueue = !isOnline || pendingOpsRef.current.length > 0;
      if (shouldQueue) {
        queueDeleteLocally(id);
        return;
      }

      try {
        if (isAutoSyncEnabled) startSync();
        await deleteTodoRemote({ id: id as Id<"todos"> });
        if (isAutoSyncEnabled) finishSync();
      } catch (error) {
        console.error("Delete todo failed, queueing locally:", error);
        queueDeleteLocally(id);
      }
    },
    [
      deleteTodoRemote,
      finishSync,
      isAutoSyncEnabled,
      isOnline,
      queueDeleteLocally,
      startSync,
    ],
  );

  const todos =
    !isOnline || pendingOps.length > 0 || remoteTodos === undefined
      ? localTodos
      : remoteTodoItems;

  const isInitialLoading =
    !isHydrated || (isOnline && remoteTodos === undefined && localTodos.length === 0);

  return {
    todos,
    isInitialLoading,
    hasPendingChanges: pendingOps.length > 0,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    syncPendingChanges,
  };
}
