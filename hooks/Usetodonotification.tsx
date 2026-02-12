import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;

export function useTodoNotification(isNotificationsEnabled: boolean) {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const todos = useQuery(api.todos.getTodos);
  const congratsHasFired = useRef(false);
  const reminderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Congrats: fires immediately when the last todo is checked off ──────────
  useEffect(() => {
    if (!isNotificationsEnabled || !todos) return;

    const allDone = todos.length > 0 && todos.every((t) => t.isCompleted);

    if (allDone && !congratsHasFired.current) {
      congratsHasFired.current = true;
      fireCongratsNotification(todos.length);
    }

    // Reset the flag if the user adds a new todo or unchecks one
    if (!allDone) {
      congratsHasFired.current = false;
    }
  }, [isNotificationsEnabled, todos]);

  // ── 5-hour reminder: schedules when there are incomplete todos,
  //    cancels immediately if all todos get completed ─────────────────────────
  useEffect(() => {
    if (!isNotificationsEnabled || !todos) return;

    const incomplete = todos.filter((t) => !t.isCompleted);
    const allDone = incomplete.length === 0;

    if (allDone) {
      // User finished everything — cancel both the JS timer and any
      // scheduled OS notification so the reminder never shows up
      clearExistingReminderTimer(reminderTimer);
      Notifications.cancelScheduledNotificationAsync("todo-reminder").catch(
        () => {},
      );
      return;
    }

    // There are incomplete todos — (re)schedule the 5-hour reminder.
    // We clear the previous timer first so it resets if the todo list changes.
    clearExistingReminderTimer(reminderTimer);

    reminderTimer.current = setTimeout(async () => {
      // Re-check at fire time in case todos changed while the timer was running
      const stillIncomplete = incomplete.filter((t) => !t.isCompleted);
      if (stillIncomplete.length > 0) {
        await fire5HourReminderNotification(stillIncomplete.length);
      }
    }, FIVE_HOURS_MS);

    return () => clearExistingReminderTimer(reminderTimer);
  }, [isNotificationsEnabled, todos]);

  // ── Pending summary: fires when the app goes to the background ─────────────
  useEffect(() => {
    if (!isNotificationsEnabled) return;

    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        const isGoingToBackground =
          appState.current === "active" &&
          (nextAppState === "background" || nextAppState === "inactive");

        if (isGoingToBackground && todos) {
          await firePendingSummaryNotification(todos);
        }

        appState.current = nextAppState;
      },
    );

    return () => subscription.remove();
  }, [isNotificationsEnabled, todos]);
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Todo = {
  _id: string;
  text: string;
  isCompleted: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clearExistingReminderTimer(
  timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
) {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

// ─── Notification logic ───────────────────────────────────────────────────────

async function fireCongratsNotification(totalCount: number) {
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: "todo-congrats",
      content: {
        title: "You crushed it today! 🎉",
        body:
          totalCount === 1
            ? "Your task is completed. Great work!"
            : `All ${totalCount} tasks completed. Great work!`,
      },
      trigger: null, // fires immediately
    });
  } catch (error) {
    console.warn("Failed to fire congrats notification:", error);
  }
}

async function fire5HourReminderNotification(incompleteCount: number) {
  try {
    // Cancel any stale reminder before firing a fresh one
    await Notifications.cancelScheduledNotificationAsync("todo-reminder").catch(
      () => {},
    );

    await Notifications.scheduleNotificationAsync({
      identifier: "todo-reminder",
      content: {
        title: "Don't forget your tasks! ⏰",
        body:
          incompleteCount === 1
            ? "You still have 1 task pending. Take a moment to finish it!"
            : `You still have ${incompleteCount} tasks pending. Take a moment to finish them!`,
      },
      trigger: null,
    });
  } catch (error) {
    console.warn("Failed to fire 5-hour reminder notification:", error);
  }
}

async function firePendingSummaryNotification(todos: Todo[]) {
  const incomplete = todos.filter((t) => !t.isCompleted);

  // All done — the congrats already fired in-app, skip this
  if (incomplete.length === 0) return;

  try {
    // Cancel any stale pending summary before firing a fresh one
    await Notifications.cancelScheduledNotificationAsync("todo-pending").catch(
      () => {},
    );

    await Notifications.scheduleNotificationAsync({
      identifier: "todo-pending",
      content: {
        title: "You still have pending tasks 📝",
        body:
          incomplete.length === 1
            ? "1 task left for today. You've got this!"
            : `${incomplete.length} tasks left for today. Keep going!`,
      },
      trigger: null,
    });
  } catch (error) {
    console.warn("Failed to fire pending summary notification:", error);
  }
}
