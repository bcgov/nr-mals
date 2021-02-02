import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { Method } from "axios";
import cdog from "../../utilities/cdog.ts";
import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS } from "../../utilities/constants";

export const fetchHealth = createAsyncThunk(
  "cdog/fetchHealth",
  async (_, thunkApi) => {
    try {
      const response = await Api.post(`cdogs/health`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const fetchTemplateRender = createAsyncThunk(
  "cdog/fetchTemplateRender",
  async (data, thunkApi) => {
    try {
      const response = await Api.getApiInstance().post(
        "/cdogs/template/render",
        data,
        {
          responseType: "arraybuffer", // Needed for binaries unless you want pain
          timeout: 30000, // Override default timeout as this call could take a while
        }
      );

      return response;

      //const response = await Api.post('/cdogs/template/render', data);
      //return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const cdogSlice = createSlice({
  name: "cdogs",
  initialState: {
    health: {
      data: undefined,
      error: undefined,
      status: REQUEST_STATUS.IDLE,
    },
    data: undefined,
    error: undefined,
    status: REQUEST_STATUS.IDLE,
  },
  extraReducers: {
    [fetchHealth.pending]: (state) => {
      state.health.error = undefined;
      state.health.status = REQUEST_STATUS.PENDING;
    },
    [fetchHealth.fulfilled]: (state, action) => {
      state.health.data = action.payload;
      state.health.error = undefined;
      state.health.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchHealth.rejected]: (state, action) => {
      state.health.data = undefined;
      state.health.error = action.payload;
      state.health.status = REQUEST_STATUS.REJECTED;
    },
    [fetchTemplateRender.pending]: (state) => {
      state.error = undefined;
      state.status = REQUEST_STATUS.PENDING;
    },
    [fetchTemplateRender.fulfilled]: (state, action) => {
      state.data = action.payload;
      state.error = undefined;
      state.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchTemplateRender.rejected]: (state, action) => {
      state.data = undefined;
      state.error = action.payload;
      state.status = REQUEST_STATUS.REJECTED;
    },
  },
});

export const selectHealth = (state) => state.cdogs.health;

export default cdogSlice.reducer;
