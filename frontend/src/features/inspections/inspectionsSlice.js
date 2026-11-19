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

async function getLicenceApiaryInspections(licenceId, page, thunkApi) {
  try {
    const response = await Api.get(
      `inspections/apiary/licence/${licenceId}?page=${page ?? 1}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof ApiError) {
      return thunkApi.rejectWithValue(error.serialize());
    }
    return thunkApi.rejectWithValue({ code: -1, description: error.message });
  }
}

// Latest inspections + site list for the licence page section
export const fetchLicenceApiaryInspections = createAsyncThunk(
  "inspections/fetchLicenceApiaryInspections",
  async (licenceId, thunkApi) =>
    getLicenceApiaryInspections(licenceId, 1, thunkApi)
);

// Paged history for the View History modal (kept separate so paging doesn't change the licence page)
export const fetchApiaryInspectionHistory = createAsyncThunk(
  "inspections/fetchApiaryInspectionHistory",
  async ({ licenceId, page }, thunkApi) =>
    getLicenceApiaryInspections(licenceId, page, thunkApi)
);

export const fetchApiaryInspectionTypes = createAsyncThunk(
  "inspections/fetchApiaryInspectionTypes",
  async (_, thunkApi) => {
    try {
      const response = await Api.get("inspections/apiary/types");
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
    licenceApiaryInspections: {
      data: undefined,
      error: undefined,
      status: REQUEST_STATUS.IDLE,
    },
    apiaryInspectionHistory: {
      data: undefined,
      error: undefined,
      status: REQUEST_STATUS.IDLE,
    },
    apiaryInspectionTypes: {
      data: [],
      error: undefined,
      status: REQUEST_STATUS.IDLE,
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
    [fetchLicenceApiaryInspections.pending]: (state) => {
      state.licenceApiaryInspections.error = undefined;
      state.licenceApiaryInspections.status = REQUEST_STATUS.PENDING;
    },
    [fetchLicenceApiaryInspections.fulfilled]: (state, action) => {
      state.licenceApiaryInspections.data = action.payload;
      state.licenceApiaryInspections.error = undefined;
      state.licenceApiaryInspections.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchLicenceApiaryInspections.rejected]: (state, action) => {
      state.licenceApiaryInspections.data = undefined;
      state.licenceApiaryInspections.error = action.payload;
      state.licenceApiaryInspections.status = REQUEST_STATUS.REJECTED;
    },
    [fetchApiaryInspectionHistory.pending]: (state) => {
      state.apiaryInspectionHistory.error = undefined;
      state.apiaryInspectionHistory.status = REQUEST_STATUS.PENDING;
    },
    [fetchApiaryInspectionHistory.fulfilled]: (state, action) => {
      state.apiaryInspectionHistory.data = action.payload;
      state.apiaryInspectionHistory.error = undefined;
      state.apiaryInspectionHistory.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchApiaryInspectionHistory.rejected]: (state, action) => {
      state.apiaryInspectionHistory.data = undefined;
      state.apiaryInspectionHistory.error = action.payload;
      state.apiaryInspectionHistory.status = REQUEST_STATUS.REJECTED;
    },
    [fetchApiaryInspectionTypes.pending]: (state) => {
      state.apiaryInspectionTypes.error = undefined;
      state.apiaryInspectionTypes.status = REQUEST_STATUS.PENDING;
    },
    [fetchApiaryInspectionTypes.fulfilled]: (state, action) => {
      state.apiaryInspectionTypes.data = action.payload;
      state.apiaryInspectionTypes.error = undefined;
      state.apiaryInspectionTypes.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchApiaryInspectionTypes.rejected]: (state, action) => {
      state.apiaryInspectionTypes.data = [];
      state.apiaryInspectionTypes.error = action.payload;
      state.apiaryInspectionTypes.status = REQUEST_STATUS.REJECTED;
    },
  },
});

export const selectCreatedInspection = (state) =>
  state.inspections.createdInspection;
export const selectCurrentInspection = (state) =>
  state.inspections.currentInspection;
export const selectLicenceApiaryInspections = (state) =>
  state.inspections.licenceApiaryInspections;
export const selectApiaryInspectionHistory = (state) =>
  state.inspections.apiaryInspectionHistory;
export const selectApiaryInspectionTypes = (state) =>
  state.inspections.apiaryInspectionTypes;

const { actions, reducer } = inspectionsSlice;

export const {
  clearCreatedInspection,
  clearCurrentInspection,
  setCurrentInspectionModeToEdit,
  setCurrentInspectionModeToView,
} = actions;

export default reducer;
