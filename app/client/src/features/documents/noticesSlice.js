import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS } from "../../utilities/constants";

export const selectQueuedNotices = (state) => state.notices.queued;
export const selectNoticeJob = (state) => state.notices.job;

export const fetchQueuedNotices = createAsyncThunk(
  "notices/fetchQueued",
  async (_, thunkApi) => {
    try {
      const response = await Api.get("documents/notices/queued");
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const startNoticeJob = createAsyncThunk(
  "notices/startNoticeJob",
  async (licenceIds, thunkApi) => {
    try {
      const response = await Api.post("documents/notices/startJob", licenceIds);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const completeNoticeJob = createAsyncThunk(
  "notices/completeNoticeJob",
  async (jobId, thunkApi) => {
    try {
      const response = await Api.post(`documents/notices/completeJob/${jobId}`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const generateNotice = createAsyncThunk(
  "notices/generateNotice",
  async (documentId, thunkApi) => {
    try {
      const response = await Api.post(
        `documents/notices/generate/${documentId}`
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
  "notices/fetchPendingDocuments",
  async (_, thunkApi) => {
    try {
      const job = selectNoticeJob(thunkApi.getState());
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

export const fetchNoticeJob = createAsyncThunk(
  "notices/fetchNoticeJob",
  async (_, thunkApi) => {
    try {
      const job = selectNoticeJob(thunkApi.getState());
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

export const noticesSlice = createSlice({
  name: "notices",
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
    clearNoticeJob: (state) => {
      state.job.id = undefined;
      state.job.details = undefined;
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.IDLE;
    },
  },
  extraReducers: {
    [fetchQueuedNotices.pending]: (state) => {
      state.queued.data = undefined;
      state.queued.status = REQUEST_STATUS.PENDING;
    },
    [fetchQueuedNotices.fulfilled]: (state, action) => {
      state.queued.data = action.payload;
      state.queued.error = undefined;
      state.queued.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchQueuedNotices.rejected]: (state, action) => {
      state.queued.data = undefined;
      state.queued.error = action.payload;
      state.queued.status = REQUEST_STATUS.REJECTED;
    },
    [startNoticeJob.pending]: (state) => {
      state.job.status = REQUEST_STATUS.PENDING;
    },
    [startNoticeJob.fulfilled]: (state, action) => {
      state.job.id = action.payload.jobId;
      state.job.pendingDocuments = action.payload.documents;
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.FULFILLED;
    },
    [startNoticeJob.rejected]: (state, action) => {
      state.job.error = action.payload;
      state.job.status = REQUEST_STATUS.REJECTED;
    },
    [completeNoticeJob.pending]: (state) => {
      state.job.status = REQUEST_STATUS.PENDING;
    },
    [completeNoticeJob.fulfilled]: (state) => {
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.FULFILLED;
    },
    [completeNoticeJob.rejected]: (state, action) => {
      state.job.error = action.payload;
      state.job.status = REQUEST_STATUS.REJECTED;
    },
    [generateNotice.fulfilled]: (state, action) => {
      state.job.pendingDocuments = state.job.pendingDocuments.filter(
        (document) => document.documentId !== action.payload.documentId
      );
    },
    [generateNotice.rejected]: (state) => {
      state.job.pendingDocuments = { ...state.job.pendingDocuments };
    },
    [fetchNoticeJob.pending]: (state) => {
      state.job.status = REQUEST_STATUS.PENDING;
    },
    [fetchNoticeJob.fulfilled]: (state, action) => {
      state.job.details = action.payload;
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchNoticeJob.rejected]: (state, action) => {
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

const { actions, reducer } = noticesSlice;

export const { clearNoticeJob } = actions;

export default reducer;
