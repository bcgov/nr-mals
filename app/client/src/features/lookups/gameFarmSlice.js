import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS } from "../../utilities/constants";

export const fetchGameFarmSpecies = createAsyncThunk(
  "gameFarm/fetchGameFarmSpecies",
  async (_, thunkApi) => {
    try {
      const speciesPromise = Api.get("game-farm/species");
      const subSpeciesPromise = Api.get("game-farm/subspecies");

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

export const gameFarmSlice = createSlice({
  name: "gameFarm",
  initialState: {
    data: undefined,
    error: undefined,
    status: REQUEST_STATUS.IDLE,
  },
  extraReducers: {
    [fetchGameFarmSpecies.pending]: (state) => {
      state.error = undefined;
      state.status = REQUEST_STATUS.PENDING;
    },
    [fetchGameFarmSpecies.fulfilled]: (state, action) => {
      state.data = action.payload;
      state.error = undefined;
      state.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchGameFarmSpecies.rejected]: (state, action) => {
      state.data = undefined;
      state.error = action.payload;
      state.status = REQUEST_STATUS.REJECTED;
    },
  },
});

export const selectGameFarmSpecies = (state) => state.lookups.gameFarm;

export default gameFarmSlice.reducer;
