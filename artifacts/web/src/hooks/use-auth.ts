import { create } from "zustand";
import { User } from "@workspace/api-client-react";

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null, token?: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: localStorage.getItem("auth_user") ? JSON.parse(localStorage.getItem("auth_user")!) : null,
  token: localStorage.getItem("auth_token") || null,
  setUser: (user, token) => {
    if (user) {
      localStorage.setItem("auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("auth_user");
    }
    
    if (token !== undefined) {
      if (token) {
        localStorage.setItem("auth_token", token);
      } else {
        localStorage.removeItem("auth_token");
      }
      set({ user, token: token || null });
    } else {
      set({ user });
    }
  },
  logout: () => {
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
    set({ user: null, token: null });
  }
}));
