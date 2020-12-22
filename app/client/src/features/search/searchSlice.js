import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS, SEARCH_TYPE } from "../../utilities/constants";

export const fetchLicenceResults = createAsyncThunk(
  "search/fetchLicenceResults",
  async (_, thunkApi) => {
    try {
      const parameters = selectLicenceParameters(thunkApi.getState());
      const response = await Api.get(`licences/search`, parameters);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const searchSlice = createSlice({
  name: "search",
  initialState: {
    licences: {
      searchType: SEARCH_TYPE.SIMPLE,
      parameters: {},
      results: {
        data: undefined,
        page: undefined,
        count: undefined,
        error: undefined,
        status: REQUEST_STATUS.IDLE,
      },
    },
  },
  reducers: {
    clearLicenceParameters: (state) => {
      state.licences.parameters = {};
      state.licences.searchType = SEARCH_TYPE.SIMPLE;
    },
    clearLicenceResults: (state) => {
      state.licences.results.data = undefined;
      state.licences.results.error = undefined;
      state.licences.results.status = REQUEST_STATUS.IDLE;
    },
    toggleLicenceSearchType: (state) => {
      const currentSearchType = state.licences.searchType;
      state.licences.searchType =
        currentSearchType === SEARCH_TYPE.SIMPLE
          ? SEARCH_TYPE.ADVANCED
          : SEARCH_TYPE.SIMPLE;
    },
    setLicenceParameters: (state, action) => {
      state.licences.parameters = action.payload;
      state.licences.results.status = REQUEST_STATUS.IDLE;
    },
    setLicenceSearchPage: (state, action) => {
      state.licences.parameters.page = action.payload;
    },
  },
  extraReducers: {
    [fetchLicenceResults.pending]: (state) => {
      state.licences.results.error = undefined;
      state.licences.results.status = REQUEST_STATUS.PENDING;
    },
    [fetchLicenceResults.fulfilled]: (state, action) => {
      state.licences.results.data = action.payload.results;
      state.licences.results.page = action.payload.page;
      state.licences.results.count = action.payload.count;
      state.licences.results.error = undefined;
      state.licences.results.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchLicenceResults.rejected]: (state, action) => {
      state.licences.results.data = undefined;
      state.licences.results.error = action.payload;
      state.licences.results.status = REQUEST_STATUS.REJECTED;
    },
  },
});

export const selectLicenceSearchType = (state) =>
  state.search.licences.searchType;
export const selectLicenceParameters = (state) =>
  state.search.licences.parameters;
export const selectLicenceResults = (state) => state.search.licences.results;

const { actions, reducer } = searchSlice;

export const {
  clearLicenceParameters,
  clearLicenceResults,
  toggleLicenceSearchType,
  setLicenceParameters,
  setLicenceSearchPage,
} = actions;

export default reducer;
