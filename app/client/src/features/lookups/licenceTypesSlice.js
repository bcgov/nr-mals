import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS } from "../../utilities/constants";

export const fetchLicenceTypes = createAsyncThunk(
  "licenseTypes/fetchLicenceTypes",
  async (_, thunkApi) => {
    try {
      const response = await Api.get("licence-types");
      // The Licence Types have no particular order but Dairy Tank Truck must appear after Dairy Farm
      // This code finds the indexes of each and places the Dairy Tank Truck licence just after Dairy Farm
      if (response.data.length > 0) {
        const dairyTankTruckIndex = response.data.findIndex(
          (item) => item.licenceType === "DAIRY TANK TRUCK"
        );
        const dairyFarmIndex = response.data.findIndex(
          (item) => item.licenceType === "DAIRY FARM"
        );
        if (dairyTankTruckIndex !== -1 && dairyFarmIndex !== -1) {
          const [dairyTankTruck] = response.data.splice(dairyTankTruckIndex, 1);
          response.data.splice(dairyFarmIndex + 1, 0, dairyTankTruck);
        }
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const updateLicenceTypes = createAsyncThunk(
  "licenseTypes/updateLicenceTypes",
  async ({ payload, id }, thunkApi) => {
    try {
      const response = await Api.post(`licence-types/${id}`, payload);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const licenceTypesSlice = createSlice({
  name: "licenceTypes",
  initialState: {
    data: undefined,
    error: undefined,
    status: REQUEST_STATUS.IDLE,
  },
  extraReducers: {
    [fetchLicenceTypes.pending]: (state) => {
      state.error = undefined;
      state.status = REQUEST_STATUS.PENDING;
    },
    [fetchLicenceTypes.fulfilled]: (state, action) => {
      state.data = action.payload;
      state.error = undefined;
      state.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchLicenceTypes.rejected]: (state, action) => {
      state.data = undefined;
      state.error = action.payload;
      state.status = REQUEST_STATUS.REJECTED;
    },
    [updateLicenceTypes.pending]: (state) => {
      state.error = undefined;
      state.status = REQUEST_STATUS.PENDING;
    },
    [updateLicenceTypes.fulfilled]: (state, action) => {
      state.data = action.payload;
      state.error = undefined;
      state.status = REQUEST_STATUS.FULFILLED;
    },
    [updateLicenceTypes.rejected]: (state, action) => {
      state.data = undefined;
      state.error = action.payload;
      state.status = REQUEST_STATUS.REJECTED;
    },
  },
});

export const selectLicenceTypes = (state) => state.lookups.licenceTypes;

export default licenceTypesSlice.reducer;
