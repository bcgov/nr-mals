import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS } from "../../utilities/constants";

export const fetchConfig = createAsyncThunk(
  "config/fetchConfig",
  async (_, thunkApi) => {
    try {
      const response = await Api.get("config");
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const configSlice = createSlice({
  name: "config",
  initialState: {
    data: {
      environment: undefined,
      nodeVersion: undefined,
      version: undefined,
    },
    error: undefined,
    status: REQUEST_STATUS.IDLE
  },
  extraReducers: {
    [fetchConfig.fulfilled]: (state, action) => {
      state.data = action.payload;
      state.error = undefined;
      state.status = REQUEST_STATUS.FULFILLED
    },
    [fetchConfig.rejected]: (state, action) => {
      state.data.environment = undefined;
      state.data.nodeVersion = undefined;
      state.data.version = undefined;
      state.error = action.payload;
      state.status = REQUEST_STATUS.REJECTED
    },
  },
});

export const selectConfig = (state) => state.config;

export default configSlice.reducer;
