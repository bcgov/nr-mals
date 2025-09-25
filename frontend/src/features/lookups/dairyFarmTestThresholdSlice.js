import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS } from "../../utilities/constants";

export const fetchDairyFarmTestThresholds = createAsyncThunk(
  "regions/fetchDairyFarmTestThresholds",
  async (_, thunkApi) => {
    try {
      const response = await Api.get("dairyfarmtestthresholds");
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const updateDairyFarmTestThresholds = createAsyncThunk(
  "regions/updateDairyFarmTestThresholds",
  async ({ payload, id }, thunkApi) => {
    try {
      const response = await Api.put(
        `admin/dairyfarmtestthresholds/${id}`,
        payload
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const dairyFarmTestThresholdSlice = createSlice({
  name: "dairyFarmTestThresholds",
  initialState: {
    data: undefined,
    error: undefined,
    status: REQUEST_STATUS.IDLE,
  },
  extraReducers: {
    [fetchDairyFarmTestThresholds.pending]: (state) => {
      state.error = undefined;
      state.status = REQUEST_STATUS.PENDING;
    },
    [fetchDairyFarmTestThresholds.fulfilled]: (state, action) => {
      state.data = action.payload;
      state.error = undefined;
      state.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchDairyFarmTestThresholds.rejected]: (state, action) => {
      state.data = undefined;
      state.error = action.payload;
      state.status = REQUEST_STATUS.REJECTED;
    },
    [updateDairyFarmTestThresholds.pending]: (state) => {
      state.error = undefined;
      state.status = REQUEST_STATUS.PENDING;
    },
    [updateDairyFarmTestThresholds.fulfilled]: (state, action) => {
      state.data = action.payload;
      state.error = undefined;
      state.status = REQUEST_STATUS.FULFILLED;
    },
    [updateDairyFarmTestThresholds.rejected]: (state, action) => {
      state.data = undefined;
      state.error = action.payload;
      state.status = REQUEST_STATUS.REJECTED;
    },
  },
});

export const selectDairyFarmTestThresholds = (state) =>
  state.lookups.dairyFarmTestThresholds;

export default dairyFarmTestThresholdSlice.reducer;
