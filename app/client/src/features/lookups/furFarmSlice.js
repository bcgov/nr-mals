import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS } from "../../utilities/constants";

export const fetchFurFarmSpecies = createAsyncThunk(
  "gameFarm/fetchFurFarmSpecies",
  async (_, thunkApi) => {
    try {
      const speciesPromise = Api.get("fur-farm/species");
      const subSpeciesPromise = Api.get("fur-farm/subspecies");

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

export const furFarmSlice = createSlice({
  name: "furFarm",
  initialState: {
    data: undefined,
    error: undefined,
    status: REQUEST_STATUS.IDLE,
  },
  extraReducers: {
    [fetchFurFarmSpecies.pending]: (state) => {
      state.error = undefined;
      state.status = REQUEST_STATUS.PENDING;
    },
    [fetchFurFarmSpecies.fulfilled]: (state, action) => {
      state.data = action.payload;
      state.error = undefined;
      state.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchFurFarmSpecies.rejected]: (state, action) => {
      state.data = undefined;
      state.error = action.payload;
      state.status = REQUEST_STATUS.REJECTED;
    },
  },
});

export const selectFurFarmSpecies = (state) => state.lookups.furFarm;

export default furFarmSlice.reducer;
