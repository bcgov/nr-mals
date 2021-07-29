import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS } from "../../utilities/constants";

export const selectQueuedDairyTankNotices = (state) =>
  state.dairyTankNotices.queued;
export const selectDairyTankNoticesJob = (state) => state.dairyTankNotices.job;

export const fetchQueuedDairyTankNotices = createAsyncThunk(
  "dairyTankNotices/fetchQueued",
  async (_, thunkApi) => {
    try {
      const response = await Api.get("documents/dairyTankNotices/queued");
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const startDairyTankNoticeJob = createAsyncThunk(
  "dairyTankNotices/startDairyTankNoticeJob",
  async (data, thunkApi) => {
    try {
      const response = await Api.post(
        "documents/dairyTankNotices/startJob",
        data
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

export const completeDairyTankNoticeJob = createAsyncThunk(
  "dairyTankNotices/completeDairyTankNoticeJob",
  async (jobId, thunkApi) => {
    try {
      const response = await Api.post(
        `documents/dairyTankNotices/completeJob/${jobId}`
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

export const generateDairyTankNotice = createAsyncThunk(
  "dairyTankNotices/generateDairyTankNotice",
  async (documentId, thunkApi) => {
    try {
      const response = await Api.post(
        `documents/dairyTankNotices/generate/${documentId}`
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
  "dairyTankNotices/fetchPendingDocuments",
  async (_, thunkApi) => {
    try {
      const job = selectDairyTankNoticesJob(thunkApi.getState());
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

export const fetchDairyTankNoticeJob = createAsyncThunk(
  "dairyTankNotices/fetchDairyTankNoticeJob",
  async (_, thunkApi) => {
    try {
      const job = selectDairyTankNoticesJob(thunkApi.getState());
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

export const dairyTankNoticesSlice = createSlice({
  name: "dairyTankNotices",
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
    clearDairyTankNoticeJob: (state) => {
      state.job.id = undefined;
      state.job.details = undefined;
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.IDLE;
    },
  },
  extraReducers: {
    [fetchQueuedDairyTankNotices.pending]: (state) => {
      state.queued.data = undefined;
      state.queued.status = REQUEST_STATUS.PENDING;
    },
    [fetchQueuedDairyTankNotices.fulfilled]: (state, action) => {
      state.queued.data = action.payload;
      state.queued.error = undefined;
      state.queued.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchQueuedDairyTankNotices.rejected]: (state, action) => {
      state.queued.data = undefined;
      state.queued.error = action.payload;
      state.queued.status = REQUEST_STATUS.REJECTED;
    },
    [startDairyTankNoticeJob.pending]: (state) => {
      state.job.status = REQUEST_STATUS.PENDING;
    },
    [startDairyTankNoticeJob.fulfilled]: (state, action) => {
      state.job.id = action.payload.jobId;
      state.job.pendingDocuments = action.payload.documents;
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.FULFILLED;
    },
    [startDairyTankNoticeJob.rejected]: (state, action) => {
      state.job.error = action.payload;
      state.job.status = REQUEST_STATUS.REJECTED;
    },
    [completeDairyTankNoticeJob.pending]: (state) => {
      state.job.status = REQUEST_STATUS.PENDING;
    },
    [completeDairyTankNoticeJob.fulfilled]: (state) => {
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.FULFILLED;
    },
    [completeDairyTankNoticeJob.rejected]: (state, action) => {
      state.job.error = action.payload;
      state.job.status = REQUEST_STATUS.REJECTED;
    },
    [generateDairyTankNotice.fulfilled]: (state, action) => {
      state.job.pendingDocuments = state.job.pendingDocuments.filter(
        (document) => document.documentId !== action.payload.documentId
      );
    },
    [generateDairyTankNotice.rejected]: (state) => {
      state.job.pendingDocuments = { ...state.job.pendingDocuments };
    },
    [fetchDairyTankNoticeJob.pending]: (state) => {
      state.job.status = REQUEST_STATUS.PENDING;
    },
    [fetchDairyTankNoticeJob.fulfilled]: (state, action) => {
      state.job.details = action.payload;
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchDairyTankNoticeJob.rejected]: (state, action) => {
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

const { actions, reducer } = dairyTankNoticesSlice;

export const { clearDairyTankNoticeJob } = actions;

export default reducer;
