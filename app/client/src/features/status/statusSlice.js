import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";

export const fetchStatus = createAsyncThunk(
  "status/fetchStatus",
  async (_, thunkApi) => {
    try {
      const response = await Api.get("status");
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const statusSlice = createSlice({
  name: "status",
  initialState: {
    data: {
      environment: undefined,
      currentUser: undefined,
    },
    error: undefined,
  },
  extraReducers: {
    [fetchStatus.fulfilled]: (state, action) => {
      state.data.environment = action.payload.environment;
      state.data.currentUser = action.payload.currentUser;
      state.error = undefined;
    },
    [fetchStatus.rejected]: (state, action) => {
      state.data.environment = undefined;
      state.data.currentUser = undefined;
      state.error = action.payload;
    },
  },
});

export const selectStatus = (state) => state.status;

export default statusSlice.reducer;
