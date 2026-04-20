import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AuthActiveRole, StoredAuthUser } from "@/lib/session";

export type VerificationDocSummary = {
  type: string;
  label: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
};

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  activeRole: AuthActiveRole;
  avatarUrl?: string | null;
  studentProfile?: {
    fullName?: string | null;
    age?: number | null;
    bio?: string | null;
    houseBio?: string | null;
    university?: string | null;
    degreeProgram?: string | null;
    semester?: string | null;
    location?: string | null;
    contact?: string | null;
    hobbies?: string | null;
    languages?: string | null;
    budgetMin?: number | null;
    budgetMax?: number | null;
    preferredDistricts?: string | null;
    moveInDate?: string | null;
    verificationStatus?: "PENDING" | "VERIFIED" | "REJECTED";
  };
  residentProfile?: {
    fullName?: string | null;
    city?: string | null;
    verificationStatus?: "PENDING" | "VERIFIED" | "REJECTED";
  };
  verificationDocs?: VerificationDocSummary[];
  capabilities?: {
    canUseStudent: boolean;
    canUseResident: boolean;
  };
  primaryHomeLabel?: string | null;
  primaryHomeId?: string | null;
};

type AuthState = {
  currentUser: CurrentUser | null;
  loading: boolean;
};

const initialState: AuthState = {
  currentUser: null,
  loading: false,
};

function applyStoredUser(storedUser: StoredAuthUser): CurrentUser {
  return {
    id: storedUser.id,
    email: storedUser.email,
    fullName: storedUser.fullName ?? storedUser.email,
    activeRole: storedUser.activeRole,
    capabilities: storedUser.capabilities,
  };
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    clearCurrentUser(state) {
      state.currentUser = null;
      state.loading = false;
    },
    setCurrentUserFromSession(state, action: PayloadAction<StoredAuthUser>) {
      state.currentUser = {
        ...(state.currentUser ?? {}),
        ...applyStoredUser(action.payload),
      } as CurrentUser;
    },
    setCurrentUserFromDatabase(state, action: PayloadAction<CurrentUser>) {
      state.currentUser = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setAuthLoading,
  clearCurrentUser,
  setCurrentUserFromSession,
  setCurrentUserFromDatabase,
} = authSlice.actions;

export default authSlice.reducer;
