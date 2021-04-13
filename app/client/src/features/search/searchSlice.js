import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS, SEARCH_TYPE } from "../../utilities/constants";
import { parseAsDate } from "../../utilities/parsing";

export const selectLicenceSearchType = (state) =>
  state.search.licences.searchType;
export const selectLicenceParameters = (state) =>
  state.search.licences.parameters;
export const selectLicenceResults = (state) => state.search.licences.results;

export const selectSiteSearchType = (state) => state.search.sites.searchType;
export const selectSiteParameters = (state) => state.search.sites.parameters;
export const selectSiteResults = (state) => state.search.sites.results;

export const selectInventoryHistorySearchType = (state) =>
  state.search.inventoryHistory.searchType;
export const selectInventoryHistoryParameters = (state) =>
  state.search.inventoryHistory.parameters;
export const selectInventoryHistoryResults = (state) =>
  state.search.inventoryHistory.results;

export const selectAssociatedLicencesSearchType = (state) =>
  state.search.associatedLicences.searchType;
export const selectAssociatedLicencesParameters = (state) =>
  state.search.associatedLicences.parameters;
export const selectAssociatedLicencesResults = (state) =>
  state.search.associatedLicences.results;

export const selectDairyTestHistoryParameters = (state) =>
  state.search.dairyTestHistory.parameters;
export const selectDairyTestHistoryResults = (state) =>
  state.search.dairyTestHistory.results;

export const fetchLicenceResults = createAsyncThunk(
  "search/fetchLicenceResults",
  async (_, thunkApi) => {
    try {
      const parameters = selectLicenceParameters(thunkApi.getState());

      const parsedParameters = {
        ...parameters,
        issuedDateFrom: parseAsDate(parameters.issuedDateFrom),
        issuedDateTo: parseAsDate(parameters.issuedDateTo),
        renewalDateFrom: parseAsDate(parameters.renewalDateFrom),
        renewalDateTo: parseAsDate(parameters.renewalDateTo),
        expiryDateFrom: parseAsDate(parameters.expiryDateFrom),
        expiryDateTo: parseAsDate(parameters.expiryDateTo),
      };

      const response = await Api.get(`licences/search`, parsedParameters);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const fetchAssociatedLicenceResults = createAsyncThunk(
  "search/fetchAssociatedLicenceResults",
  async (parentOrChildLicenceTypeId, thunkApi) => {
    try {
      const parameters = selectLicenceParameters(thunkApi.getState());

      const parsedParameters = {
        ...parameters,
        parentOrChildLicenceTypeId,
      };

      const response = await Api.get(
        `licences/associatedsearch`,
        parsedParameters
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

export const fetchSiteResults = createAsyncThunk(
  "search/fetchSiteResults",
  async (_, thunkApi) => {
    try {
      const parameters = selectSiteParameters(thunkApi.getState());

      const parsedParameters = {
        ...parameters,
      };

      const response = await Api.get(`sites/search`, parsedParameters);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const fetchInventoryHistoryResults = createAsyncThunk(
  "search/fetchInventoryHistoryResults",
  async (_, thunkApi) => {
    try {
      const parameters = selectInventoryHistoryParameters(thunkApi.getState());

      const parsedParameters = {
        ...parameters,
      };

      const response = await Api.get(
        `licences/inventoryhistory`,
        parsedParameters
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

export const fetchAssociatedLicencesResults = createAsyncThunk(
  "search/fetchAssociatedLicencesResults",
  async (_, thunkApi) => {
    try {
      const parameters = selectAssociatedLicencesParameters(
        thunkApi.getState()
      );

      const parsedParameters = {
        ...parameters,
      };

      const response = await Api.get(`licences/associated`, parsedParameters);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const fetchDairyTestHistoryResults = createAsyncThunk(
  "search/fetchDairyTestHistoryResults",
  async (_, thunkApi) => {
    try {
      const parameters = selectDairyTestHistoryParameters(thunkApi.getState());

      const parsedParameters = {
        ...parameters,
      };

      const response = await Api.get(
        `licences/dairytesthistory`,
        parsedParameters
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
    sites: {
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
    inventoryHistory: {
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
    associatedLicences: {
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
    dairyTestHistory: {
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
    // Licences
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

    // Sites
    clearSiteParameters: (state) => {
      state.sites.parameters = {};
      state.sites.searchType = SEARCH_TYPE.SIMPLE;
    },
    clearSiteResults: (state) => {
      state.sites.results.data = undefined;
      state.sites.results.error = undefined;
      state.sites.results.status = REQUEST_STATUS.IDLE;
    },
    toggleSiteSearchType: (state) => {
      const currentSearchType = state.sites.searchType;
      state.sites.searchType =
        currentSearchType === SEARCH_TYPE.SIMPLE
          ? SEARCH_TYPE.ADVANCED
          : SEARCH_TYPE.SIMPLE;
    },
    setSiteParameters: (state, action) => {
      state.sites.parameters = action.payload;
      state.sites.results.status = REQUEST_STATUS.IDLE;
    },
    setSiteSearchPage: (state, action) => {
      state.sites.parameters.page = action.payload;
    },

    // Inventory History
    clearInventoryHistoryParameters: (state) => {
      state.inventoryHistory.parameters = {};
      state.inventoryHistory.searchType = SEARCH_TYPE.SIMPLE;
    },
    clearInventoryHistoryResults: (state) => {
      state.inventoryHistory.results.data = undefined;
      state.inventoryHistory.results.error = undefined;
      state.inventoryHistory.results.status = REQUEST_STATUS.IDLE;
    },
    toggleInventoryHistorySearchType: (state) => {
      const currentSearchType = state.inventoryHistory.searchType;
      state.inventoryHistory.searchType =
        currentSearchType === SEARCH_TYPE.SIMPLE
          ? SEARCH_TYPE.ADVANCED
          : SEARCH_TYPE.SIMPLE;
    },
    setInventoryHistoryParameters: (state, action) => {
      state.inventoryHistory.parameters = action.payload;
      state.inventoryHistory.results.status = REQUEST_STATUS.IDLE;
    },
    setInventoryHistorySearchPage: (state, action) => {
      state.inventoryHistory.parameters.page = action.payload;
    },

    // Associated Licences
    clearAssociatedLicencesParameters: (state) => {
      state.associatedLicences.parameters = {};
      state.associatedLicences.searchType = SEARCH_TYPE.SIMPLE;
    },
    clearAssociatedLicencesResults: (state) => {
      state.associatedLicences.results.data = undefined;
      state.associatedLicences.results.error = undefined;
      state.associatedLicences.results.status = REQUEST_STATUS.IDLE;
    },
    toggleAssociatedLicencesSearchType: (state) => {
      const currentSearchType = state.associatedLicences.searchType;
      state.associatedLicences.searchType =
        currentSearchType === SEARCH_TYPE.SIMPLE
          ? SEARCH_TYPE.ADVANCED
          : SEARCH_TYPE.SIMPLE;
    },
    setAssociatedLicencesParameters: (state, action) => {
      state.associatedLicences.parameters = action.payload;
      state.associatedLicences.results.status = REQUEST_STATUS.IDLE;
    },
    setAssociatedLicencesSearchPage: (state, action) => {
      state.associatedLicences.parameters.page = action.payload;
    },

    // Dairy Test History
    clearDairyTestHistoryParameters: (state) => {
      state.dairyTestHistory.parameters = {};
      state.dairyTestHistory.searchType = SEARCH_TYPE.SIMPLE;
    },
    clearDairyTestHistoryResults: (state) => {
      state.dairyTestHistory.results.data = undefined;
      state.dairyTestHistory.results.error = undefined;
      state.dairyTestHistory.results.status = REQUEST_STATUS.IDLE;
    },
    setDairyTestHistoryParameters: (state, action) => {
      state.dairyTestHistory.parameters = action.payload;
      state.dairyTestHistory.results.status = REQUEST_STATUS.IDLE;
    },
    setDairyTestHistorySearchPage: (state, action) => {
      state.dairyTestHistory.parameters.page = action.payload;
    },
  },
  extraReducers: {
    // Licences
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

    // Associated Licences - uses licence state
    [fetchAssociatedLicenceResults.pending]: (state) => {
      state.licences.results.error = undefined;
      state.licences.results.status = REQUEST_STATUS.PENDING;
    },
    [fetchAssociatedLicenceResults.fulfilled]: (state, action) => {
      state.licences.results.data = action.payload.results;
      state.licences.results.page = action.payload.page;
      state.licences.results.count = action.payload.count;
      state.licences.results.error = undefined;
      state.licences.results.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchAssociatedLicenceResults.rejected]: (state, action) => {
      state.licences.results.data = undefined;
      state.licences.results.error = action.payload;
      state.licences.results.status = REQUEST_STATUS.REJECTED;
    },

    // Sites
    [fetchSiteResults.pending]: (state) => {
      state.sites.results.error = undefined;
      state.sites.results.status = REQUEST_STATUS.PENDING;
    },
    [fetchSiteResults.fulfilled]: (state, action) => {
      state.sites.results.data = action.payload.results;
      state.sites.results.page = action.payload.page;
      state.sites.results.count = action.payload.count;
      state.sites.results.error = undefined;
      state.sites.results.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchSiteResults.rejected]: (state, action) => {
      state.sites.results.data = undefined;
      state.sites.results.error = action.payload;
      state.sites.results.status = REQUEST_STATUS.REJECTED;
    },

    // Inventory History
    [fetchInventoryHistoryResults.pending]: (state) => {
      state.inventoryHistory.results.error = undefined;
      state.inventoryHistory.results.status = REQUEST_STATUS.PENDING;
    },
    [fetchInventoryHistoryResults.fulfilled]: (state, action) => {
      state.inventoryHistory.results.data = action.payload.results;
      state.inventoryHistory.results.page = action.payload.page;
      state.inventoryHistory.results.count = action.payload.count;
      state.inventoryHistory.results.error = undefined;
      state.inventoryHistory.results.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchInventoryHistoryResults.rejected]: (state, action) => {
      state.inventoryHistory.results.data = undefined;
      state.inventoryHistory.results.error = action.payload;
      state.inventoryHistory.results.status = REQUEST_STATUS.REJECTED;
    },

    // Associated Licences
    [fetchAssociatedLicencesResults.pending]: (state) => {
      state.associatedLicences.results.error = undefined;
      state.associatedLicences.results.status = REQUEST_STATUS.PENDING;
    },
    [fetchAssociatedLicencesResults.fulfilled]: (state, action) => {
      state.associatedLicences.results.data = action.payload.results;
      state.associatedLicences.results.page = action.payload.page;
      state.associatedLicences.results.count = action.payload.count;
      state.associatedLicences.results.error = undefined;
      state.associatedLicences.results.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchAssociatedLicencesResults.rejected]: (state, action) => {
      state.associatedLicences.results.data = undefined;
      state.associatedLicences.results.error = action.payload;
      state.associatedLicences.results.status = REQUEST_STATUS.REJECTED;
    },

    // Dairy Test History
    [fetchDairyTestHistoryResults.pending]: (state) => {
      state.dairyTestHistory.results.error = undefined;
      state.dairyTestHistory.results.status = REQUEST_STATUS.PENDING;
    },
    [fetchDairyTestHistoryResults.fulfilled]: (state, action) => {
      state.dairyTestHistory.results.data = action.payload.results;
      state.dairyTestHistory.results.page = action.payload.page;
      state.dairyTestHistory.results.count = action.payload.count;
      state.dairyTestHistory.results.error = undefined;
      state.dairyTestHistory.results.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchDairyTestHistoryResults.rejected]: (state, action) => {
      state.dairyTestHistory.results.data = undefined;
      state.dairyTestHistory.results.error = action.payload;
      state.dairyTestHistory.results.status = REQUEST_STATUS.REJECTED;
    },
  },
});

const { actions, reducer } = searchSlice;

export const {
  clearLicenceParameters,
  clearLicenceResults,
  toggleLicenceSearchType,
  setLicenceParameters,
  setLicenceSearchPage,

  clearSiteParameters,
  clearSiteResults,
  toggleSiteSearchType,
  setSiteParameters,
  setSiteSearchPage,

  clearInventoryHistoryParameters,
  clearInventoryHistoryResults,
  toggleInventoryHistorySearchType,
  setInventoryHistoryParameters,
  setInventoryHistorySearchPage,

  clearAssociatedLicencesParameters,
  clearAssociatedLicencesResults,
  toggleAssociatedLicencesSearchType,
  setAssociatedLicencesParameters,
  setAssociatedLicencesSearchPage,

  clearDairyTestHistoryParameters,
  clearDairyTestHistoryResults,
  setDairyTestHistoryParameters,
  setDairyTestHistorySearchPage,
} = actions;

export default reducer;
