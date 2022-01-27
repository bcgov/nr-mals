import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS } from "../../utilities/constants";

export const selectQueuedDairyNotices = (state) => state.dairyNotices.queued;
export const selectDairyNoticesJob = (state) => state.dairyNotices.job;

export const fetchQueuedDairyNotices = createAsyncThunk(
  "dairyNotices/fetchQueued",
  async (payload, thunkApi) => {
    try {
      const response = await Api.post(
        "documents/dairyNotices/queued",
        payload,
        30000
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

export const startDairyNoticeJob = createAsyncThunk(
  "dairyNotices/startDairyNoticeJob",
  async (data, thunkApi) => {
    try {
      const response = await Api.post("documents/dairyNotices/startJob", data);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const completeDairyNoticeJob = createAsyncThunk(
  "dairyNotices/completeDairyNoticeJob",
  async (jobId, thunkApi) => {
    try {
      const response = await Api.post(
        `documents/dairyNotices/completeJob/${jobId}`
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

export const generateDairyNotice = createAsyncThunk(
  "dairyNotices/generateDairyNotice",
  async (documentId, thunkApi) => {
    try {
      const response = await Api.post(
        `documents/dairyNotices/generate/${documentId}`
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
  "dairyNotices/fetchPendingDocuments",
  async (_, thunkApi) => {
    try {
      const job = selectDairyNoticesJob(thunkApi.getState());
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

export const fetchDairyNoticeJob = createAsyncThunk(
  "dairyNotices/fetchDairyNoticeJob",
  async (_, thunkApi) => {
    try {
      const job = selectDairyNoticesJob(thunkApi.getState());
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

export const dairyNoticesSlice = createSlice({
  name: "dairyNotices",
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
    clearDairyNoticeJob: (state) => {
      state.job.id = undefined;
      state.job.details = undefined;
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.IDLE;
    },
  },
  extraReducers: {
    [fetchQueuedDairyNotices.pending]: (state) => {
      state.queued.data = undefined;
      state.queued.status = REQUEST_STATUS.PENDING;
    },
    [fetchQueuedDairyNotices.fulfilled]: (state, action) => {
      state.queued.data = action.payload;
      state.queued.error = undefined;
      state.queued.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchQueuedDairyNotices.rejected]: (state, action) => {
      state.queued.data = undefined;
      state.queued.error = action.payload;
      state.queued.status = REQUEST_STATUS.REJECTED;
    },
    [startDairyNoticeJob.pending]: (state) => {
      state.job.status = REQUEST_STATUS.PENDING;
    },
    [startDairyNoticeJob.fulfilled]: (state, action) => {
      state.job.id = action.payload.jobId;
      state.job.pendingDocuments = action.payload.documents;
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.FULFILLED;
    },
    [startDairyNoticeJob.rejected]: (state, action) => {
      state.job.error = action.payload;
      state.job.status = REQUEST_STATUS.REJECTED;
    },
    [completeDairyNoticeJob.pending]: (state) => {
      state.job.status = REQUEST_STATUS.PENDING;
    },
    [completeDairyNoticeJob.fulfilled]: (state) => {
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.FULFILLED;
    },
    [completeDairyNoticeJob.rejected]: (state, action) => {
      state.job.error = action.payload;
      state.job.status = REQUEST_STATUS.REJECTED;
    },
    [generateDairyNotice.fulfilled]: (state, action) => {
      state.job.pendingDocuments = state.job.pendingDocuments.filter(
        (document) => document.documentId !== action.payload.documentId
      );
    },
    [generateDairyNotice.rejected]: (state) => {
      state.job.pendingDocuments = { ...state.job.pendingDocuments };
    },
    [fetchDairyNoticeJob.pending]: (state) => {
      state.job.status = REQUEST_STATUS.PENDING;
    },
    [fetchDairyNoticeJob.fulfilled]: (state, action) => {
      state.job.details = action.payload;
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchDairyNoticeJob.rejected]: (state, action) => {
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

const { actions, reducer } = dairyNoticesSlice;

export const { clearDairyNoticeJob } = actions;

export default reducer;
