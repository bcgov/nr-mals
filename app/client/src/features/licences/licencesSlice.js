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

export const fetchLicence = createAsyncThunk(
  "licences/fetchLicence",
  async (id, thunkApi) => {
    try {
      const response = await Api.get(`licences/${id}`);
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
    currentLicence: {
      data: undefined,
      error: undefined,
      status: REQUEST_STATUS.IDLE,
    },
  },
  reducers: {
    clearCreatedLicence: (state) => {
      state.createdLicence.data = undefined;
      state.createdLicence.error = undefined;
      state.createdLicence.status = REQUEST_STATUS.IDLE;
    },
    clearCurrentLicence: (state) => {
      state.currentLicence.data = undefined;
      state.currentLicence.error = undefined;
      state.currentLicence.status = REQUEST_STATUS.IDLE;
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
    [fetchLicence.pending]: (state) => {
      state.currentLicence.error = undefined;
      state.currentLicence.status = REQUEST_STATUS.PENDING;
    },
    [fetchLicence.fulfilled]: (state, action) => {
      state.currentLicence.data = action.payload;
      state.currentLicence.error = undefined;
      state.currentLicence.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchLicence.rejected]: (state, action) => {
      state.currentLicence.data = undefined;
      state.currentLicence.error = action.payload;
      state.currentLicence.status = REQUEST_STATUS.REJECTED;
    },
  },
});

export const selectCreatedLicence = (state) => state.licences.createdLicence;
export const selectCurrentLicence = (state) => state.licences.currentLicence;

const { actions, reducer } = licencesSlice;

export const { clearCreatedLicence, clearCurrentLicence } = actions;

export default reducer;
