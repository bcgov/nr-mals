import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import {
  REQUEST_STATUS,
  LICENCE_MODE,
  REGISTRANT_MODE,
} from "../../utilities/constants";

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

export const updateLicence = createAsyncThunk(
  "licences/updateLicence",
  async ({ licence, id }, thunkApi) => {
    try {
      const response = await Api.put(`licences/${id}`, licence);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const updateLicenceRegistrants = createAsyncThunk(
  "licences/updateLicenceRegistrants",
  async ({ registrants, id }, thunkApi) => {
    try {
      const response = await Api.put(`licences/${id}/registrants`, registrants);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const updateLicenceInventory = createAsyncThunk(
  "licences/updateLicenceInventory",
  async ({ inventory, id }, thunkApi) => {
    try {
      const response = await Api.put(`licences/${id}/inventory`, inventory);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const deleteLicenceInventoryHistory = createAsyncThunk(
  "licences/deleteLicenceInventoryHistory",
  async ({ data, licenceId }, thunkApi) => {
    try {
      const response = await Api.put(
        `licences/${licenceId}/inventory/delete/${data.id}`
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

export const updateAssociatedLicences = createAsyncThunk(
  "licences/updateAssociatedLicences",
  async ({ data, licenceId }, thunkApi) => {
    try {
      const response = await Api.put(`licences/${licenceId}/associated`, data);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const deleteAssociatedLicences = createAsyncThunk(
  "licences/deleteAssociatedLicences",
  async ({ data, licenceId }, thunkApi) => {
    try {
      const response = await Api.put(
        `licences/${licenceId}/associated/delete`,
        data
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

export const renewLicence = createAsyncThunk(
  "licences/renewLicence",
  async ({ data, id }, thunkApi) => {
    try {
      const response = await Api.put(`licences/renew/${id}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const updateLicenceCheckboxes = createAsyncThunk(
  "licences/updateLicenceCheckboxes",
  async ({ data, id }, thunkApi) => {
    try {
      const response = await Api.put(`licences/checkboxes/${id}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const fetchLicenceDairyTestResults = createAsyncThunk(
  "licences/fetchLicenceDairyTestResults",
  async (id, thunkApi) => {
    try {
      const response = await Api.get(`licences/dairytestresults/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const updateLicenceDairyTestResults = createAsyncThunk(
  "licences/updateLicenceDairyTestResults",
  async ({ data, id }, thunkApi) => {
    try {
      const response = await Api.put(`licences/dairytestresults/${id}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const calculateWarningLevyNotice = createAsyncThunk(
  "licences/calculateWarningLevyNotice",
  async ({ data, id }, thunkApi) => {
    try {
      const response = await Api.put(`licences/dairyactions/${id}`, data);
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
      mode: LICENCE_MODE.VIEW,
      registrantMode: REGISTRANT_MODE.VIEW,
    },
    dairyTestResults: {
      data: undefined,
      warningLevyNotice: undefined,
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

      state.dairyTestResults.data = undefined;
      state.dairyTestResults.error = undefined;
      state.dairyTestResults.status = REQUEST_STATUS.IDLE;
    },
    setCurrentLicenceModeToEdit: (state) => {
      state.currentLicence.mode = LICENCE_MODE.EDIT;
    },
    setCurrentLicenceModeToView: (state) => {
      state.currentLicence.mode = LICENCE_MODE.VIEW;
    },
    setCurrentLicenceRegistrantModeToEdit: (state) => {
      state.currentLicence.registrantMode = REGISTRANT_MODE.EDIT;
    },
    setCurrentLicenceRegistrantModeToView: (state) => {
      state.currentLicence.registrantMode = REGISTRANT_MODE.VIEW;
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
      state.currentLicence.mode = LICENCE_MODE.VIEW;
      state.currentLicence.registrantMode = REGISTRANT_MODE.VIEW;
    },
    [fetchLicence.rejected]: (state, action) => {
      state.currentLicence.data = undefined;
      state.currentLicence.error = action.payload;
      state.currentLicence.status = REQUEST_STATUS.REJECTED;
    },
    [updateLicence.pending]: (state) => {
      state.currentLicence.error = undefined;
      state.currentLicence.status = REQUEST_STATUS.PENDING;
    },
    [updateLicence.fulfilled]: (state, action) => {
      state.currentLicence.data = action.payload;
      state.currentLicence.error = undefined;
      state.currentLicence.status = REQUEST_STATUS.FULFILLED;
      state.currentLicence.mode = LICENCE_MODE.VIEW;
    },
    [updateLicence.rejected]: (state, action) => {
      state.currentLicence.error = action.payload;
      state.currentLicence.status = REQUEST_STATUS.REJECTED;
    },
    [renewLicence.pending]: (state) => {
      state.currentLicence.error = undefined;
      state.currentLicence.status = REQUEST_STATUS.PENDING;
    },
    [renewLicence.fulfilled]: (state, action) => {
      state.currentLicence.data = action.payload;
      state.currentLicence.error = undefined;
      state.currentLicence.status = REQUEST_STATUS.FULFILLED;
      state.currentLicence.mode = LICENCE_MODE.VIEW;
    },
    [renewLicence.rejected]: (state, action) => {
      state.currentLicence.error = action.payload;
      state.currentLicence.status = REQUEST_STATUS.REJECTED;
    },
    [updateLicenceCheckboxes.pending]: (state) => {
      state.currentLicence.error = undefined;
      state.currentLicence.status = REQUEST_STATUS.PENDING;
    },
    [updateLicenceCheckboxes.fulfilled]: (state) => {
      state.currentLicence.error = undefined;
      state.currentLicence.status = REQUEST_STATUS.FULFILLED;
    },
    [updateLicenceCheckboxes.rejected]: (state, action) => {
      state.currentLicence.error = action.payload;
      state.currentLicence.status = REQUEST_STATUS.REJECTED;
    },
    [updateLicenceRegistrants.pending]: (state) => {
      state.currentLicence.error = undefined;
      state.currentLicence.status = REQUEST_STATUS.PENDING;
    },
    [updateLicenceRegistrants.fulfilled]: (state, action) => {
      state.currentLicence.data = action.payload;
      state.currentLicence.error = undefined;
      state.currentLicence.status = REQUEST_STATUS.FULFILLED;
      state.currentLicence.registrantMode = REGISTRANT_MODE.VIEW;
    },
    [updateLicenceRegistrants.rejected]: (state, action) => {
      state.currentLicence.error = action.payload;
      state.currentLicence.status = REQUEST_STATUS.REJECTED;
    },
    [updateLicenceInventory.pending]: (state) => {
      state.currentLicence.error = undefined;
      state.currentLicence.status = REQUEST_STATUS.PENDING;
    },
    [updateLicenceInventory.fulfilled]: (state, action) => {
      state.currentLicence.data = action.payload;
      state.currentLicence.error = undefined;
      state.currentLicence.status = REQUEST_STATUS.FULFILLED;
    },
    [updateLicenceInventory.rejected]: (state, action) => {
      state.currentLicence.error = action.payload;
      state.currentLicence.status = REQUEST_STATUS.REJECTED;
    },
    [deleteLicenceInventoryHistory.pending]: (state) => {
      state.currentLicence.error = undefined;
      state.currentLicence.status = REQUEST_STATUS.PENDING;
    },
    [deleteLicenceInventoryHistory.fulfilled]: (state, action) => {
      state.currentLicence.data = action.payload;
      state.currentLicence.error = undefined;
      state.currentLicence.status = REQUEST_STATUS.FULFILLED;
    },
    [deleteLicenceInventoryHistory.rejected]: (state, action) => {
      state.currentLicence.error = action.payload;
      state.currentLicence.status = REQUEST_STATUS.REJECTED;
    },
    [updateAssociatedLicences.pending]: (state) => {
      state.currentLicence.error = undefined;
      state.currentLicence.status = REQUEST_STATUS.PENDING;
    },
    [updateAssociatedLicences.fulfilled]: (state, action) => {
      state.currentLicence.data = action.payload;
      state.currentLicence.error = undefined;
      state.currentLicence.status = REQUEST_STATUS.FULFILLED;
    },
    [updateAssociatedLicences.rejected]: (state, action) => {
      state.currentLicence.error = action.payload;
      state.currentLicence.status = REQUEST_STATUS.REJECTED;
    },
    [deleteAssociatedLicences.pending]: (state) => {
      state.currentLicence.error = undefined;
      state.currentLicence.status = REQUEST_STATUS.PENDING;
    },
    [deleteAssociatedLicences.fulfilled]: (state, action) => {
      state.currentLicence.data = action.payload;
      state.currentLicence.error = undefined;
      state.currentLicence.status = REQUEST_STATUS.FULFILLED;
    },
    [deleteAssociatedLicences.rejected]: (state, action) => {
      state.currentLicence.error = action.payload;
      state.currentLicence.status = REQUEST_STATUS.REJECTED;
    },
    [fetchLicenceDairyTestResults.pending]: (state) => {
      state.dairyTestResults.error = undefined;
      state.dairyTestResults.status = REQUEST_STATUS.PENDING;
    },
    [fetchLicenceDairyTestResults.fulfilled]: (state, action) => {
      state.dairyTestResults.data = action.payload;
      state.dairyTestResults.error = undefined;
      state.dairyTestResults.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchLicenceDairyTestResults.rejected]: (state, action) => {
      state.dairyTestResults.error = action.payload;
      state.dairyTestResults.status = REQUEST_STATUS.REJECTED;
    },
    [updateLicenceDairyTestResults.pending]: (state) => {
      state.dairyTestResults.error = undefined;
      state.dairyTestResults.status = REQUEST_STATUS.PENDING;
    },
    [updateLicenceDairyTestResults.fulfilled]: (state, action) => {
      state.dairyTestResults.data = action.payload;
      state.dairyTestResults.error = undefined;
      state.dairyTestResults.status = REQUEST_STATUS.FULFILLED;
    },
    [updateLicenceDairyTestResults.rejected]: (state, action) => {
      state.dairyTestResults.error = action.payload;
      state.dairyTestResults.status = REQUEST_STATUS.REJECTED;
    },
    [calculateWarningLevyNotice.pending]: (state) => {
      state.dairyTestResults.error = undefined;
      state.dairyTestResults.status = REQUEST_STATUS.PENDING;
    },
    [calculateWarningLevyNotice.fulfilled]: (state, action) => {
      state.dairyTestResults.warningLevyNotice = action.payload;
      state.dairyTestResults.error = undefined;
      state.dairyTestResults.status = REQUEST_STATUS.FULFILLED;
    },
    [calculateWarningLevyNotice.rejected]: (state, action) => {
      state.dairyTestResults.error = action.payload;
      state.dairyTestResults.status = REQUEST_STATUS.REJECTED;
    },
  },
});

export const selectCreatedLicence = (state) => state.licences.createdLicence;
export const selectCurrentLicence = (state) => state.licences.currentLicence;
export const selectDairyTestResults = (state) =>
  state.licences.dairyTestResults;

const { actions, reducer } = licencesSlice;

export const {
  clearCreatedLicence,
  clearCurrentLicence,
  setCurrentLicenceModeToEdit,
  setCurrentLicenceModeToView,
  setCurrentLicenceRegistrantModeToEdit,
  setCurrentLicenceRegistrantModeToView,
} = actions;

export default reducer;
