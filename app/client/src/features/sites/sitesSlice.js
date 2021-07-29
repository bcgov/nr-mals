import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import {
  REQUEST_STATUS,
  LICENCE_MODE,
  DAIRY_TANK_MODE,
} from "../../utilities/constants";

export const createSite = createAsyncThunk(
  "sites/createSite",
  async (site, thunkApi) => {
    try {
      const response = await Api.post("sites", site);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const updateSite = createAsyncThunk(
  "sites/updateSite",
  async ({ site, id }, thunkApi) => {
    try {
      const response = await Api.put(`sites/${id}`, site);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const updateSiteDairyTanks = createAsyncThunk(
  "licences/updateSiteDairyTanks",
  async ({ dairyTanks, id }, thunkApi) => {
    try {
      const response = await Api.put(`sites/${id}/dairytanks`, dairyTanks);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const updateSiteDairyTankRecheckNotice = createAsyncThunk(
  "licences/updateSiteDairyTankRecheckNotice",
  async ({ data, id }, thunkApi) => {
    try {
      const response = await Api.put(`sites/dairytanksrecheck/${id}`, data);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const fetchSite = createAsyncThunk(
  "sites/fetchSite",
  async (id, thunkApi) => {
    try {
      const response = await Api.get(`sites/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const sitesSlice = createSlice({
  name: "sites",
  initialState: {
    createdSite: {
      data: undefined,
      error: undefined,
      status: REQUEST_STATUS.IDLE,
    },
    currentSite: {
      data: undefined,
      error: undefined,
      status: REQUEST_STATUS.IDLE,
      mode: LICENCE_MODE.VIEW,
      dairyTankMode: DAIRY_TANK_MODE.VIEW,
    },
  },
  reducers: {
    clearCreatedSite: (state) => {
      state.createdSite.data = undefined;
      state.createdSite.error = undefined;
      state.createdSite.status = REQUEST_STATUS.IDLE;
    },
    clearCurrentSite: (state) => {
      state.currentSite.data = undefined;
      state.currentSite.error = undefined;
      state.currentSite.status = REQUEST_STATUS.IDLE;
    },
    setCurrentSiteModeToEdit: (state) => {
      state.currentSite.mode = LICENCE_MODE.EDIT;
    },
    setCurrentSiteModeToView: (state) => {
      state.currentSite.mode = LICENCE_MODE.VIEW;
    },
    setCurrentSiteDairyTankModeToEdit: (state) => {
      state.currentSite.dairyTankMode = DAIRY_TANK_MODE.EDIT;
    },
    setCurrentSiteDairyTankModeToView: (state) => {
      state.currentSite.dairyTankMode = DAIRY_TANK_MODE.VIEW;
    },
  },
  extraReducers: {
    [createSite.pending]: (state) => {
      state.createdSite.error = undefined;
      state.createdSite.status = REQUEST_STATUS.PENDING;
    },
    [createSite.fulfilled]: (state, action) => {
      state.createdSite.data = action.payload;
      state.createdSite.error = undefined;
      state.createdSite.status = REQUEST_STATUS.FULFILLED;
    },
    [createSite.rejected]: (state, action) => {
      state.createdSite.data = undefined;
      state.createdSite.error = action.payload;
      state.createdSite.status = REQUEST_STATUS.REJECTED;
    },
    [fetchSite.pending]: (state) => {
      state.currentSite.error = undefined;
      state.currentSite.status = REQUEST_STATUS.PENDING;
    },
    [fetchSite.fulfilled]: (state, action) => {
      state.currentSite.data = action.payload;
      state.currentSite.error = undefined;
      state.currentSite.status = REQUEST_STATUS.FULFILLED;
      state.currentSite.mode = LICENCE_MODE.VIEW;
      state.currentSite.dairyTankMode = DAIRY_TANK_MODE.VIEW;
    },
    [fetchSite.rejected]: (state, action) => {
      state.currentSite.data = undefined;
      state.currentSite.error = action.payload;
      state.currentSite.status = REQUEST_STATUS.REJECTED;
    },
    [updateSite.pending]: (state) => {
      state.currentSite.error = undefined;
      state.currentSite.status = REQUEST_STATUS.PENDING;
    },
    [updateSite.fulfilled]: (state, action) => {
      state.currentSite.data = action.payload;
      state.currentSite.error = undefined;
      state.currentSite.status = REQUEST_STATUS.FULFILLED;
      state.currentSite.mode = LICENCE_MODE.VIEW;
      state.currentSite.dairyTankMode = DAIRY_TANK_MODE.VIEW;
    },
    [updateSite.rejected]: (state, action) => {
      state.currentSite.error = action.payload;
      state.currentSite.status = REQUEST_STATUS.REJECTED;
    },
    [updateSiteDairyTanks.pending]: (state) => {
      state.currentSite.error = undefined;
      state.currentSite.status = REQUEST_STATUS.PENDING;
    },
    [updateSiteDairyTanks.fulfilled]: (state, action) => {
      state.currentSite.data = action.payload;
      state.currentSite.error = undefined;
      state.currentSite.status = REQUEST_STATUS.FULFILLED;
      state.currentSite.mode = LICENCE_MODE.VIEW;
      state.currentSite.dairyTankMode = DAIRY_TANK_MODE.VIEW;
    },
    [updateSiteDairyTanks.rejected]: (state, action) => {
      state.currentSite.error = action.payload;
      state.currentSite.status = REQUEST_STATUS.REJECTED;
    },
  },
});

export const selectCreatedSite = (state) => state.sites.createdSite;
export const selectCurrentSite = (state) => state.sites.currentSite;

const { actions, reducer } = sitesSlice;

export const {
  clearCreatedSite,
  clearCurrentSite,
  setCurrentSiteModeToEdit,
  setCurrentSiteModeToView,
  setCurrentSiteDairyTankModeToEdit,
  setCurrentSiteDairyTankModeToView,
} = actions;

export default reducer;
