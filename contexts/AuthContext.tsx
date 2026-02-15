import { useAuthActions } from "@convex-dev/auth/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useConvexAuth } from "convex/react";
import React, { createContext, ReactNode, useContext } from "react";

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "USER_NOT_FOUND"
  | "EMAIL_IN_USE"
  | "INVALID_EMAIL"
  | "WEAK_PASSWORD"
  | "RATE_LIMITED"
  | "UNKNOWN";

export class AppAuthError extends Error {
  code: AuthErrorCode;
  cause?: unknown;

  constructor(code: AuthErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "AppAuthError";
    this.code = code;
    this.cause = cause;
  }
}

const normalizeAuthError = (
  error: unknown,
  flow: "signIn" | "signUp",
): AppAuthError => {
  const err = error as any;
  const rawMessage = String(err?.message ?? "");
  const rawCode = String(err?.code ?? "");
  const combined = `${rawMessage} ${rawCode}`.toLowerCase();

  if (combined.includes("too many requests") || combined.includes("rate limit")) {
    return new AppAuthError(
      "RATE_LIMITED",
      "Too many attempts. Please try again in a moment.",
      error,
    );
  }

  if (flow === "signIn") {
    if (
      combined.includes("invalid credentials") ||
      combined.includes("invalid password") ||
      combined.includes("incorrect password") ||
      combined.includes("wrong password")
    ) {
      return new AppAuthError(
        "INVALID_CREDENTIALS",
        "Incorrect email or password.",
        error,
      );
    }

    if (
      combined.includes("user not found") ||
      combined.includes("account not found") ||
      combined.includes("no user")
    ) {
      return new AppAuthError(
        "USER_NOT_FOUND",
        "No account found for this email.",
        error,
      );
    }
  }

  if (flow === "signUp") {
    if (
      combined.includes("already exists") ||
      combined.includes("already registered") ||
      combined.includes("email already") ||
      combined.includes("already in use")
    ) {
      return new AppAuthError(
        "EMAIL_IN_USE",
        "This email is already in use. Try signing in instead.",
        error,
      );
    }

    if (combined.includes("invalid email")) {
      return new AppAuthError(
        "INVALID_EMAIL",
        "Please enter a valid email address.",
        error,
      );
    }

    if (
      combined.includes("weak password") ||
      combined.includes("password") ||
      combined.includes("at least")
    ) {
      return new AppAuthError(
        "WEAK_PASSWORD",
        "Password does not meet requirements.",
        error,
      );
    }
  }

  return new AppAuthError("UNKNOWN", "Authentication failed.", error);
};

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_SESSION_KEY = "@todo_app:has_authenticated_session";

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

  React.useEffect(() => {
    if (isAuthenticated) {
      AsyncStorage.setItem(AUTH_SESSION_KEY, "true").catch((error) => {
        console.error("Failed to persist auth session:", error);
      });
    }
  }, [isAuthenticated]);

  const signIn = async (email: string, password: string) => {
    try {
      await signInAction("password", { email, password, flow: "signIn" });
    } catch (error) {
      throw normalizeAuthError(error, "signIn");
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const result = await signInAction("password", {
        email,
        password,
        name,
        flow: "signUp",
      });
      return result;
    } catch (error) {
      throw normalizeAuthError(error, "signUp");
    }
  };

  const signOut = async () => {
    try {
      await signOutAction();
      await AsyncStorage.removeItem(AUTH_SESSION_KEY);
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
