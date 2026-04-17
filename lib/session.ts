export const AUTH_STORAGE_KEY = "fairmatch_user";

export type AuthActiveRole = "STUDENT" | "RESIDENT";

export type StoredAuthUser = {
  id: string;
  email: string;
  activeRole: AuthActiveRole;
  fullName?: string;
  capabilities?: {
    canUseStudent: boolean;
    canUseResident: boolean;
  };
};

export function getStoredAuthUser(): StoredAuthUser | null {
  if (typeof window === "undefined") return null;

  const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as
      | StoredAuthUser
      | (Omit<StoredAuthUser, "activeRole"> & {
          role?: "STUDENT" | "RESIDENT";
        });

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const activeRole =
      "activeRole" in parsed && parsed.activeRole
        ? parsed.activeRole
        : (parsed.role ?? "STUDENT");

    return {
      id: parsed.id,
      email: parsed.email,
      fullName: parsed.fullName,
      capabilities: parsed.capabilities,
      activeRole,
    };
  } catch {
    return null;
  }
}

export function setStoredAuthUser(user: StoredAuthUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredAuthUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getUiRoleFromAuthUser(
  user: StoredAuthUser | null,
): "student" | "landlord" | null {
  if (!user) return null;
  return user.activeRole === "RESIDENT" ? "landlord" : "student";
}
