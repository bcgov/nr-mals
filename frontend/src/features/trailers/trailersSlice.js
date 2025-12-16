import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS, LICENCE_MODE } from "../../utilities/constants";

export const createTrailer = createAsyncThunk(
  "trailers/createTrailer",
  async (trailer, thunkApi) => {
    try {
      const response = await Api.post("trailers", trailer);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const updateTrailer = createAsyncThunk(
  "trailers/updateTrailer",
  async ({ trailer, id }, thunkApi) => {
    try {
      const response = await Api.put(`trailers/${id}`, trailer);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const fetchTrailer = createAsyncThunk(
  "trailers/fetchTrailer",
  async (id, thunkApi) => {
    try {
      const response = await Api.get(`trailers/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const trailersSlice = createSlice({
  name: "trailers",
  initialState: {
    createdTrailer: {
      data: undefined,
      error: undefined,
      status: REQUEST_STATUS.IDLE,
    },
    currentTrailer: {
      data: undefined,
      error: undefined,
      status: REQUEST_STATUS.IDLE,
      mode: LICENCE_MODE.VIEW,
    },
  },
  reducers: {
    clearCreatedTrailer: (state) => {
      state.createdTrailer.data = undefined;
      state.createdTrailer.error = undefined;
      state.createdTrailer.status = REQUEST_STATUS.IDLE;
    },
    clearCurrentTrailer: (state) => {
      state.currentTrailer.data = undefined;
      state.currentTrailer.error = undefined;
      state.currentTrailer.status = REQUEST_STATUS.IDLE;
    },
    setCurrentTrailerModeToEdit: (state) => {
      state.currentTrailer.mode = LICENCE_MODE.EDIT;
    },
    setCurrentTrailerModeToView: (state) => {
      state.currentTrailer.mode = LICENCE_MODE.VIEW;
    },
  },
  extraReducers: {
    [createTrailer.pending]: (state) => {
      state.createdTrailer.error = undefined;
      state.createdTrailer.status = REQUEST_STATUS.PENDING;
    },
    [createTrailer.fulfilled]: (state, action) => {
      state.createdTrailer.data = action.payload;
      state.createdTrailer.error = undefined;
      state.createdTrailer.status = REQUEST_STATUS.FULFILLED;
    },
    [createTrailer.rejected]: (state, action) => {
      state.createdTrailer.data = undefined;
      state.createdTrailer.error = action.payload;
      state.createdTrailer.status = REQUEST_STATUS.REJECTED;
    },
    [fetchTrailer.pending]: (state) => {
      state.currentTrailer.error = undefined;
      state.currentTrailer.status = REQUEST_STATUS.PENDING;
    },
    [fetchTrailer.fulfilled]: (state, action) => {
      state.currentTrailer.data = action.payload;
      state.currentTrailer.error = undefined;
      state.currentTrailer.status = REQUEST_STATUS.FULFILLED;
      state.currentTrailer.mode = LICENCE_MODE.VIEW;
    },
    [fetchTrailer.rejected]: (state, action) => {
      state.currentTrailer.data = undefined;
      state.currentTrailer.error = action.payload;
      state.currentTrailer.status = REQUEST_STATUS.REJECTED;
    },
    [updateTrailer.pending]: (state) => {
      state.currentTrailer.error = undefined;
      state.currentTrailer.status = REQUEST_STATUS.PENDING;
    },
    [updateTrailer.fulfilled]: (state, action) => {
      state.currentTrailer.data = action.payload;
      state.currentTrailer.error = undefined;
      state.currentTrailer.status = REQUEST_STATUS.FULFILLED;
      state.currentTrailer.mode = LICENCE_MODE.VIEW;
    },
    [updateTrailer.rejected]: (state, action) => {
      state.currentTrailer.error = action.payload;
      state.currentTrailer.status = REQUEST_STATUS.REJECTED;
    },
  },
});

export const selectCreatedTrailer = (state) => state.trailers.createdTrailer;
export const selectCurrentTrailer = (state) => state.trailers.currentTrailer;

const { actions, reducer } = trailersSlice;

export const {
  clearCreatedTrailer,
  clearCurrentTrailer,
  setCurrentTrailerModeToEdit,
  setCurrentTrailerModeToView,
} = actions;

export default reducer;
