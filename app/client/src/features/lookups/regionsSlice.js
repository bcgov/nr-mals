import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS } from "../../utilities/constants";

export const fetchRegions = createAsyncThunk(
  "regions/fetchRegions",
  async (_, thunkApi) => {
    try {
      const regionPromise = Api.get("regions");
      const regionalDistrictsPromise = Api.get("regional-districts");

      return await Promise.all([regionPromise, regionalDistrictsPromise]).then(
        ([regions, regionalDistricts]) => {
          return {
            regions: regions.data,
            regionalDistricts: regionalDistricts.data,
          };
        }
      );
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const regionsSlice = createSlice({
  name: "regions",
  initialState: {
    data: undefined,
    error: undefined,
    status: REQUEST_STATUS.IDLE,
  },
  extraReducers: {
    [fetchRegions.pending]: (state) => {
      state.error = undefined;
      state.status = REQUEST_STATUS.PENDING;
    },
    [fetchRegions.fulfilled]: (state, action) => {
      state.data = action.payload;
      state.error = undefined;
      state.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchRegions.rejected]: (state, action) => {
      state.data = undefined;
      state.error = action.payload;
      state.status = REQUEST_STATUS.REJECTED;
    },
  },
});

export const selectRegions = (state) => state.lookups.regions;

export default regionsSlice.reducer;
