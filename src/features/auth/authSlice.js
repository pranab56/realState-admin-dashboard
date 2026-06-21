
import { createSlice } from "@reduxjs/toolkit";
import { getToken, removeToken, saveToken } from "../../utils/storage";


const initialState = {
  token: typeof window !== "undefined" ? getToken() : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      saveToken(action.payload);
    },
    logout: (state) => {
      state.token = null;
      removeToken();
    },
  },
});

export const { setToken, logout } = authSlice.actions;
export default authSlice.reducer;
