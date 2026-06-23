import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../features/auth/authApi";
import authReducer from "../features/auth/authSlice";
import newDataReducer from "../features/notifications/newDataSlice";

const apis = [authApi];

export const store = configureStore({
  reducer: {
    auth: authReducer,
    newData: newDataReducer,
    ...Object.fromEntries(apis.map((api) => [api.reducerPath, api.reducer])),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apis.map((api) => api.middleware)),
});
