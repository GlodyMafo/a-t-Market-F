import { create } from "zustand";
import { tokenStorage } from "@/lib/token-storage";
import type { AuthResult, SessionUser } from "@/types/domain";

type Status = "loading" | "authenticated" | "anonymous";

interface SessionState {
  user: SessionUser | null;
  status: Status;
  setSession: (result: AuthResult) => void;
  setUser: (user: SessionUser) => void;
  setAnonymous: () => void;
  clear: () => void;
}

export const useSession = create<SessionState>()((set) => ({
  user: null,
  status: "loading", // identique côté serveur et navigateur : pas de décalage d'affichage
  setSession: ({ user, token }) => {
    tokenStorage.set(token);
    set({ user, status: "authenticated" });
  },
  setUser: (user) => set({ user, status: "authenticated" }),
  setAnonymous: () => set({ user: null, status: "anonymous" }),
  clear: () => {
    tokenStorage.clear();
    set({ user: null, status: "anonymous" });
  },
}));