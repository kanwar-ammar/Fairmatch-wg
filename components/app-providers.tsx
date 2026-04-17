"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";

import { getStoredAuthUser, setStoredAuthUser } from "@/lib/session";
import { store } from "@/store";
import {
  clearCurrentUser,
  setAuthLoading,
  setCurrentUserFromDatabase,
  setCurrentUserFromSession,
  type CurrentUser,
} from "@/store/auth-slice";
import { useAppDispatch } from "@/store/hooks";

function CurrentUserBootstrap() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  useEffect(() => {
    const syncCurrentUser = async () => {
      const storedUser = getStoredAuthUser();

      if (!storedUser) {
        dispatch(clearCurrentUser());
        return;
      }

      dispatch(setAuthLoading(true));
      dispatch(setCurrentUserFromSession(storedUser));

      try {
        const response = await fetch(
          `/api/users/current?userId=${encodeURIComponent(storedUser.id)}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          dispatch(setAuthLoading(false));
          return;
        }

        const payload = (await response.json()) as { user?: CurrentUser };
        if (!payload.user) {
          dispatch(setAuthLoading(false));
          return;
        }

        dispatch(setCurrentUserFromDatabase(payload.user));
        setStoredAuthUser({
          id: payload.user.id,
          email: payload.user.email,
          fullName: payload.user.fullName,
          activeRole: payload.user.activeRole,
          capabilities: payload.user.capabilities,
        });
      } catch {
        dispatch(setAuthLoading(false));
      }
    };

    void syncCurrentUser();
  }, [dispatch, pathname]);

  useEffect(() => {
    const handleStorage = () => {
      const nextStoredUser = getStoredAuthUser();
      if (!nextStoredUser) {
        dispatch(clearCurrentUser());
        return;
      }
      dispatch(setCurrentUserFromSession(nextStoredUser));
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [dispatch]);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <CurrentUserBootstrap />
      {children}
    </Provider>
  );
}
