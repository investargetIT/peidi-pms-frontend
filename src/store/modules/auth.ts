import { defineStore } from "pinia";
import { store } from "../utils";

export const useAuthStore = defineStore({
  id: "peidi-auth",
  state: () => ({
    // 是否是管理员
    isAdmin: false
  }),
  actions: {
    setIsAdmin(isAdmin: boolean) {
      this.isAdmin = isAdmin;
    }
  }
});

export function useAuthStoreHook() {
  return useAuthStore(store);
}
