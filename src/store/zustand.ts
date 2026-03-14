// src/store/auth.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Tenant } from "../types";

interface AuthState {
  token: string | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  setAuth: (token: string, tenant: Tenant) => void;
  logout: () => void;
  updateTenant: (tenant: Partial<Tenant>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      tenant: null,
      isAuthenticated: false,

      setAuth: (token, tenant) => {
        localStorage.setItem("multidb_token", token);
        set({ token, tenant, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem("multidb_token");
        localStorage.removeItem("multidb_api_key");
        set({ token: null, tenant: null, isAuthenticated: false });
      },

      updateTenant: (data) => {
        const current = get().tenant;
        if (current) set({ tenant: { ...current, ...data } });
      },
    }),
    {
      name: "multidb_auth",
      partialize: (s) => ({
        token: s.token,
        tenant: s.tenant,
        isAuthenticated: s.isAuthenticated,
      }),
    },
  ),
);
