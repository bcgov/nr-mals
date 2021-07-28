import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS } from "../../utilities/constants";

export const selectQueuedRenewals = (state) => state.renewals.queued;
export const selectRenewalsJob = (state) => state.renewals.job;

export const fetchQueuedRenewals = createAsyncThunk(
  "renewals/fetchQueued",
  async (_, thunkApi) => {
    try {
      const response = await Api.get("documents/renewals/queued");
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const fetchQueuedApiaryRenewals = createAsyncThunk(
  "renewals/fetchQueuedApiary",
  async (payload, thunkApi) => {
    try {
      const response = await Api.post(
        "documents/renewals/apiary/queued",
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

export const startRenewalJob = createAsyncThunk(
  "renewals/startRenewalJob",
  async (licenceIds, thunkApi) => {
    try {
      const response = await Api.post(
        "documents/renewals/startJob",
        licenceIds
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

export const completeRenewalJob = createAsyncThunk(
  "renewals/completeRenewalJob",
  async (jobId, thunkApi) => {
    try {
      const response = await Api.post(
        `documents/renewals/completeJob/${jobId}`
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

export const generateRenewal = createAsyncThunk(
  "renewals/generateRenewal",
  async (documentId, thunkApi) => {
    try {
      const response = await Api.post(
        `documents/renewals/generate/${documentId}`
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

export const fetchPendingDocuments = createAsyncThunk(
  "renewals/fetchPendingDocuments",
  async (_, thunkApi) => {
    try {
      const job = selectRenewalsJob(thunkApi.getState());
      const response = await Api.get(`documents/pending/${job.id}`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const fetchRenewalJob = createAsyncThunk(
  "renewals/fetchRenewalJob",
  async (_, thunkApi) => {
    try {
      const job = selectRenewalsJob(thunkApi.getState());
      const response = await Api.get(`documents/jobs/${job.id}`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const renewalsSlice = createSlice({
  name: "renewals",
  initialState: {
    queued: {
      data: undefined,
      error: undefined,
      status: REQUEST_STATUS.IDLE,
    },
    job: {
      id: undefined,
      details: undefined,
      pendingDocuments: undefined,
      error: undefined,
      status: REQUEST_STATUS.IDLE,
    },
  },
  reducers: {
    clearRenewalJob: (state) => {
      state.job.id = undefined;
      state.job.details = undefined;
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.IDLE;
    },
  },
  extraReducers: {
    [fetchQueuedRenewals.pending]: (state) => {
      state.queued.data = undefined;
      state.queued.status = REQUEST_STATUS.PENDING;
    },
    [fetchQueuedRenewals.fulfilled]: (state, action) => {
      state.queued.data = action.payload;
      state.queued.error = undefined;
      state.queued.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchQueuedRenewals.rejected]: (state, action) => {
      state.queued.data = undefined;
      state.queued.error = action.payload;
      state.queued.status = REQUEST_STATUS.REJECTED;
    },
    [fetchQueuedApiaryRenewals.pending]: (state) => {
      state.queued.data = undefined;
      state.queued.status = REQUEST_STATUS.PENDING;
    },
    [fetchQueuedApiaryRenewals.fulfilled]: (state, action) => {
      state.queued.data = action.payload;
      state.queued.error = undefined;
      state.queued.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchQueuedApiaryRenewals.rejected]: (state, action) => {
      state.queued.data = undefined;
      state.queued.error = action.payload;
      state.queued.status = REQUEST_STATUS.REJECTED;
    },
    [startRenewalJob.pending]: (state) => {
      state.job.status = REQUEST_STATUS.PENDING;
    },
    [startRenewalJob.fulfilled]: (state, action) => {
      state.job.id = action.payload.jobId;
      state.job.pendingDocuments = action.payload.documents;
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.FULFILLED;
    },
    [startRenewalJob.rejected]: (state, action) => {
      state.job.error = action.payload;
      state.job.status = REQUEST_STATUS.REJECTED;
    },
    [completeRenewalJob.pending]: (state) => {
      state.job.status = REQUEST_STATUS.PENDING;
    },
    [completeRenewalJob.fulfilled]: (state) => {
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.FULFILLED;
    },
    [completeRenewalJob.rejected]: (state, action) => {
      state.job.error = action.payload;
      state.job.status = REQUEST_STATUS.REJECTED;
    },
    [generateRenewal.fulfilled]: (state, action) => {
      state.job.pendingDocuments = state.job.pendingDocuments.filter(
        (document) => document.documentId !== action.payload.documentId
      );
    },
    [generateRenewal.rejected]: (state) => {
      state.job.pendingDocuments = { ...state.job.pendingDocuments };
    },
    [fetchRenewalJob.pending]: (state) => {
      state.job.status = REQUEST_STATUS.PENDING;
    },
    [fetchRenewalJob.fulfilled]: (state, action) => {
      state.job.details = action.payload;
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchRenewalJob.rejected]: (state, action) => {
      state.job.error = action.payload;
      state.job.status = REQUEST_STATUS.REJECTED;
    },
    [fetchPendingDocuments.pending]: (state) => {
      state.pendingDocuments.data = undefined;
      state.pendingDocuments.status = REQUEST_STATUS.PENDING;
    },
    [fetchPendingDocuments.fulfilled]: (state, action) => {
      state.pendingDocuments.data = action.payload;
      state.pendingDocuments.error = undefined;
      state.pendingDocuments.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchPendingDocuments.rejected]: (state, action) => {
      state.pendingDocuments.data = undefined;
      state.pendingDocuments.error = action.payload;
      state.pendingDocuments.status = REQUEST_STATUS.REJECTED;
    },
  },
});

const { actions, reducer } = renewalsSlice;

export const { clearRenewalJob } = actions;

export default reducer;
