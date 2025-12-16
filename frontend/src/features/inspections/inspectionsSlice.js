import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS, LICENCE_MODE } from "../../utilities/constants";

export const fetchApiaryInspection = createAsyncThunk(
  "inspections/fetchApiaryInspection",
  async (id, thunkApi) => {
    try {
      const response = await Api.get(`inspections/apiary/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const createApiaryInspection = createAsyncThunk(
  "inspections/createApiaryInspection",
  async (inspection, thunkApi) => {
    try {
      const response = await Api.post("inspections/apiary", inspection);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const updateApiaryInspection = createAsyncThunk(
  "inspections/updateApiaryInspection",
  async ({ inspection, id }, thunkApi) => {
    try {
      const response = await Api.put(`inspections/apiary/${id}`, inspection);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const inspectionsSlice = createSlice({
  name: "inspections",
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
    [createApiaryInspection.pending]: (state) => {
      state.createdInspection.error = undefined;
      state.createdInspection.status = REQUEST_STATUS.PENDING;
    },
    [createApiaryInspection.fulfilled]: (state, action) => {
      state.createdInspection.data = action.payload;
      state.createdInspection.error = undefined;
      state.createdInspection.status = REQUEST_STATUS.FULFILLED;
    },
    [createApiaryInspection.rejected]: (state, action) => {
      state.createdInspection.data = undefined;
      state.createdInspection.error = action.payload;
      state.createdInspection.status = REQUEST_STATUS.REJECTED;
    },
    [fetchApiaryInspection.pending]: (state) => {
      state.currentInspection.error = undefined;
      state.currentInspection.status = REQUEST_STATUS.PENDING;
    },
    [fetchApiaryInspection.fulfilled]: (state, action) => {
      state.currentInspection.data = action.payload;
      state.currentInspection.error = undefined;
      state.currentInspection.status = REQUEST_STATUS.FULFILLED;
      state.currentInspection.mode = LICENCE_MODE.VIEW;
    },
    [fetchApiaryInspection.rejected]: (state, action) => {
      state.currentInspection.data = undefined;
      state.currentInspection.error = action.payload;
      state.currentInspection.status = REQUEST_STATUS.REJECTED;
    },
    [updateApiaryInspection.pending]: (state) => {
      state.currentInspection.error = undefined;
      state.currentInspection.status = REQUEST_STATUS.PENDING;
    },
    [updateApiaryInspection.fulfilled]: (state, action) => {
      state.currentInspection.data = action.payload;
      state.currentInspection.error = undefined;
      state.currentInspection.status = REQUEST_STATUS.FULFILLED;
      state.currentInspection.mode = LICENCE_MODE.VIEW;
    },
    [updateApiaryInspection.rejected]: (state, action) => {
      state.currentInspection.error = action.payload;
      state.currentInspection.status = REQUEST_STATUS.REJECTED;
    },
  },
});

export const selectCreatedInspection = (state) =>
  state.inspections.createdInspection;
export const selectCurrentInspection = (state) =>
  state.inspections.currentInspection;

const { actions, reducer } = inspectionsSlice;

export const {
  clearCreatedInspection,
  clearCurrentInspection,
  setCurrentInspectionModeToEdit,
  setCurrentInspectionModeToView,
} = actions;

export default reducer;
