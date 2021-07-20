import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS } from "../../utilities/constants";

export const fetchSlaughterhouseSpecies = createAsyncThunk(
  "saleYard/fetchSlaughterhouseSpecies",
  async (_, thunkApi) => {
    try {
      const speciesPromise = Api.get("slaughterhouse-species/species");
      const subSpeciesPromise = Api.get("slaughterhouse-species/subspecies");

      return await Promise.all([speciesPromise, subSpeciesPromise]).then(
        ([species, subSpecies]) => {
          return {
            species: species.data,
            subSpecies: subSpecies.data,
          };
        }
      );
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const createSlaughterhouseSpecies = createAsyncThunk(
  "saleYard/createSlaughterhouseSpecies",
  async (payload, thunkApi) => {
    try {
      const response = await Api.post(
        `slaughterhouse-species/species`,
        payload
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

export const updateSlaughterhouseSpecies = createAsyncThunk(
  "saleYard/updateSlaughterhouseSpecies",
  async ({ payload, id }, thunkApi) => {
    try {
      const response = await Api.put(
        `slaughterhouse-species/species/${id}`,
        payload
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

export const slaughterhouseSpeciesSlice = createSlice({
  name: "slaughterhouseSpecies",
  initialState: {
    data: undefined,
    error: undefined,
    status: REQUEST_STATUS.IDLE,
  },
  extraReducers: {
    [fetchSlaughterhouseSpecies.pending]: (state) => {
      state.error = undefined;
      state.status = REQUEST_STATUS.PENDING;
    },
    [fetchSlaughterhouseSpecies.fulfilled]: (state, action) => {
      state.data = action.payload;
      state.error = undefined;
      state.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchSlaughterhouseSpecies.rejected]: (state, action) => {
      state.data = undefined;
      state.error = action.payload;
      state.status = REQUEST_STATUS.REJECTED;
    },
    [createSlaughterhouseSpecies.pending]: (state) => {
      state.error = undefined;
      state.status = REQUEST_STATUS.PENDING;
    },
    [createSlaughterhouseSpecies.fulfilled]: (state, action) => {
      state.data = action.payload;
      state.error = undefined;
      state.status = REQUEST_STATUS.FULFILLED;
    },
    [createSlaughterhouseSpecies.rejected]: (state, action) => {
      state.data = undefined;
      state.error = action.payload;
      state.status = REQUEST_STATUS.REJECTED;
    },
    [updateSlaughterhouseSpecies.pending]: (state) => {
      state.error = undefined;
      state.status = REQUEST_STATUS.PENDING;
    },
    [updateSlaughterhouseSpecies.fulfilled]: (state, action) => {
      state.data = action.payload;
      state.error = undefined;
      state.status = REQUEST_STATUS.FULFILLED;
    },
    [updateSlaughterhouseSpecies.rejected]: (state, action) => {
      state.data = undefined;
      state.error = action.payload;
      state.status = REQUEST_STATUS.REJECTED;
    },
  },
});

export const selectSlaughterhouseSpecies = (state) =>
  state.lookups.slaughterhouseSpecies;

export default slaughterhouseSpeciesSlice.reducer;
