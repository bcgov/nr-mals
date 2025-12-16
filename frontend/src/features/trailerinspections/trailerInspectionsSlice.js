import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS, LICENCE_MODE } from "../../utilities/constants.js";

export const fetchTrailerInspection = createAsyncThunk(
  "trailerinspections/fetchTrailerInspection",
  async (id, thunkApi) => {
    try {
      const response = await Api.get(`inspections/trailer/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const createTrailerInspection = createAsyncThunk(
  "trailerinspections/createTrailerInspection",
  async (inspection, thunkApi) => {
    try {
      const response = await Api.post("inspections/trailer", inspection);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const updateTrailerInspection = createAsyncThunk(
  "trailerinspections/updateTrailerInspection",
  async ({ inspection, id }, thunkApi) => {
    try {
      const response = await Api.put(`inspections/trailer/${id}`, inspection);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const trailerInspectionsSlice = createSlice({
  name: "trailerinspections",
  initialState: {
    createdInspection: {
      data: undefined,
      error: undefined,
      status: REQUEST_STATUS.IDLE,
    },
    currentInspection: {
      data: undefined,
      error: undefined,
      status: REQUEST_STATUS.IDLE,
      mode: LICENCE_MODE.VIEW,
    },
  },
  reducers: {
    clearCreatedInspection: (state) => {
      state.createdInspection.data = undefined;
      state.createdInspection.error = undefined;
      state.createdInspection.status = REQUEST_STATUS.IDLE;
    },
    clearCurrentInspection: (state) => {
      state.currentInspection.data = undefined;
      state.currentInspection.error = undefined;
      state.currentInspection.status = REQUEST_STATUS.IDLE;
    },
    setCurrentInspectionModeToEdit: (state) => {
      state.currentInspection.mode = LICENCE_MODE.EDIT;
    },
    setCurrentInspectionModeToView: (state) => {
      state.currentInspection.mode = LICENCE_MODE.VIEW;
    },
  },
  extraReducers: {
    [createTrailerInspection.pending]: (state) => {
      state.createdInspection.error = undefined;
      state.createdInspection.status = REQUEST_STATUS.PENDING;
    },
    [createTrailerInspection.fulfilled]: (state, action) => {
      state.createdInspection.data = action.payload;
      state.createdInspection.error = undefined;
      state.createdInspection.status = REQUEST_STATUS.FULFILLED;
    },
    [createTrailerInspection.rejected]: (state, action) => {
      state.createdInspection.data = undefined;
      state.createdInspection.error = action.payload;
      state.createdInspection.status = REQUEST_STATUS.REJECTED;
    },
    [fetchTrailerInspection.pending]: (state) => {
      state.currentInspection.error = undefined;
      state.currentInspection.status = REQUEST_STATUS.PENDING;
    },
    [fetchTrailerInspection.fulfilled]: (state, action) => {
      state.currentInspection.data = action.payload;
      state.currentInspection.error = undefined;
      state.currentInspection.status = REQUEST_STATUS.FULFILLED;
      state.currentInspection.mode = LICENCE_MODE.VIEW;
    },
    [fetchTrailerInspection.rejected]: (state, action) => {
      state.currentInspection.data = undefined;
      state.currentInspection.error = action.payload;
      state.currentInspection.status = REQUEST_STATUS.REJECTED;
    },
    [updateTrailerInspection.pending]: (state) => {
      state.currentInspection.error = undefined;
      state.currentInspection.status = REQUEST_STATUS.PENDING;
    },
    [updateTrailerInspection.fulfilled]: (state, action) => {
      state.currentInspection.data = action.payload;
      state.currentInspection.error = undefined;
      state.currentInspection.status = REQUEST_STATUS.FULFILLED;
      state.currentInspection.mode = LICENCE_MODE.VIEW;
    },
    [updateTrailerInspection.rejected]: (state, action) => {
      state.currentInspection.error = action.payload;
      state.currentInspection.status = REQUEST_STATUS.REJECTED;
    },
  },
});

export const selectCreatedInspection = (state) =>
  state.trailerinspections.createdInspection;
export const selectCurrentInspection = (state) =>
  state.trailerinspections.currentInspection;

const { actions, reducer } = trailerInspectionsSlice;

export const {
  clearCreatedInspection,
  clearCurrentInspection,
  setCurrentInspectionModeToEdit,
  setCurrentInspectionModeToView,
} = actions;

export default reducer;
