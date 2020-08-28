import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS } from "../../utilities/constants";

export const createLicence = createAsyncThunk(
  "licences/createLicence",
  async (licence, thunkApi) => {
    try {
      const response = await Api.post("licences", licence);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const licencesSlice = createSlice({
  name: "licences",
  initialState: {
    createdLicence: {
      data: undefined,
      error: undefined,
      status: REQUEST_STATUS.IDLE,
    },
  },
  reducers: {
    clearCreatedLicence: (state) => {
      state.createdLicence.data = undefined;
      state.createdLicence.error = undefined;
      state.createdLicence.status = REQUEST_STATUS.PENDING;
    },
  },
  extraReducers: {
    [createLicence.pending]: (state) => {
      state.createdLicence.error = undefined;
      state.createdLicence.status = REQUEST_STATUS.PENDING;
    },
    [createLicence.fulfilled]: (state, action) => {
      state.createdLicence.data = action.payload;
      state.createdLicence.error = undefined;
      state.createdLicence.status = REQUEST_STATUS.FULFILLED;
    },
    [createLicence.rejected]: (state, action) => {
      state.createdLicence.data = undefined;
      state.createdLicence.error = action.payload;
      state.createdLicence.status = REQUEST_STATUS.REJECTED;
    },
  },
});

export const selectCreatedLicence = (state) => state.licences.createdLicence;

const { actions, reducer } = licencesSlice;

export const { clearCreatedLicence } = actions;

export default reducer;
