import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import React, { createContext, ReactNode, useContext } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn: signInAction, signOut: signOutAction } = useAuthActions();

  React.useEffect(() => {
    console.log(
      "Auth state changed - isAuthenticated:",
      isAuthenticated,
      "isLoading:",
      isLoading,
    );
  }, [isAuthenticated, isLoading]);

  const signIn = async (email: string, password: string) => {
    try {
      await signInAction("password", { email, password, flow: "signIn" });
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log("AuthContext: signUp called with email:", email);
      console.log("AuthContext: Calling signInAction with flow: signUp");
      const result = await signInAction("password", {
        email,
        password,
        flow: "signUp",
      });
      console.log("AuthContext: signUp result:", result);
      return result;
    } catch (error) {
      console.error("AuthContext: signUp error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutAction();
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user: null,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
