import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  unseen: {}, // { [key]: count }
};

const newDataSlice = createSlice({
  name: "newData",
  initialState,
  reducers: {
    setUnseenCount: (state, action) => {
      const { key, count } = action.payload;
      state.unseen[key] = count;
    },
    clearUnseenCount: (state, action) => {
      const key = action.payload;
      state.unseen[key] = 0;
    },
  },
});

export const { setUnseenCount, clearUnseenCount } = newDataSlice.actions;
export default newDataSlice.reducer;
