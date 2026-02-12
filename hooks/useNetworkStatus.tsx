import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial network state
    const getInitialState = async () => {
      try {
        const state = await NetInfo.fetch();
        setIsOnline(state.isConnected ?? true);
      } catch (error) {
        console.error("Failed to fetch network status:", error);
        setIsOnline(true); // Default to online on error
      } finally {
        setIsLoading(false);
      }
    };

    getInitialState();

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isOnline,
    isLoading,
  };
}
