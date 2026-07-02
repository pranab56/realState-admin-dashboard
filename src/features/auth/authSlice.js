import { createSlice } from "@reduxjs/toolkit";
import { getToken, removeToken, saveToken } from "../../utils/storage";

const getStoredRole = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("role") || null;
};

const getStoredPermissions = () => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("permissions") || "[]");
  } catch {
    return [];
  }
};

// permissions are "ready" only when we already have cached data in localStorage,
// so the sidebar can render correctly on the very first paint after a refresh.
const getPermissionsReady = () => {
  if (typeof window === "undefined") return false;
  const role = localStorage.getItem("role");
  if (!role) return false;
  if (role === "super_admin") return true;
  // admin: ready only if we already have a cached permissions list
  return localStorage.getItem("permissions") !== null;
};

const initialState = {
  token: typeof window !== "undefined" ? getToken() : null,
  role: getStoredRole(),
  permissions: getStoredPermissions(),
  permissionsReady: getPermissionsReady(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      saveToken(action.payload);
    },
    setPermissions: (state, action) => {
      state.permissions = action.payload;
      localStorage.setItem("permissions", JSON.stringify(action.payload));
    },
    setRole: (state, action) => {
      state.role = action.payload;
      localStorage.setItem("role", action.payload);
    },
    setPermissionsReady: (state, action) => {
      state.permissionsReady = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.permissions = [];
      state.permissionsReady = false;
      removeToken();
      localStorage.removeItem("role");
      localStorage.removeItem("permissions");
    },
  },
});

export const { setToken, setPermissions, setRole, setPermissionsReady, logout } = authSlice.actions;
export default authSlice.reducer;
