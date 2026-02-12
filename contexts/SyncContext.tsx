import React, {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
} from "react";

type SyncStatus = "idle" | "syncing" | "synced" | "error";

interface SyncContextType {
  syncStatus: SyncStatus;
  hasUnsyncedChanges: boolean;
  startSync: () => void;
  finishSync: () => void;
  errorSync: () => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [hasUnsyncedChanges, setHasUnsyncedChanges] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startSync = useCallback(() => {
    if (syncTimer.current) {
      clearTimeout(syncTimer.current);
    }
    setSyncStatus("syncing");
    setHasUnsyncedChanges(false);
  }, []);

  const finishSync = useCallback(() => {
    setSyncStatus("synced");
    setHasUnsyncedChanges(false);

    // Clear any existing timer
    if (syncTimer.current) {
      clearTimeout(syncTimer.current);
    }

    // After 2 seconds, go back to idle
    syncTimer.current = setTimeout(() => {
      setSyncStatus("idle");
    }, 2000);
  }, []);

  const errorSync = useCallback(() => {
    setSyncStatus("error");
    setHasUnsyncedChanges(true);

    // Clear any existing timer
    if (syncTimer.current) {
      clearTimeout(syncTimer.current);
    }

    // After 3 seconds, go back to idle but keep hasUnsyncedChanges
    syncTimer.current = setTimeout(() => {
      setSyncStatus("idle");
    }, 3000);
  }, []);

  return (
    <SyncContext.Provider
      value={{
        syncStatus,
        hasUnsyncedChanges,
        startSync,
        finishSync,
        errorSync,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncStatus() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSyncStatus must be used within SyncProvider");
  }
  return context;
}
