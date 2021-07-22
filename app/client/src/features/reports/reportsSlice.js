import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS } from "../../utilities/constants";

export const selectQueuedReports = (state) => state.reports.queued;
export const selectReportsJob = (state) => state.reports.job;

export const fetchActionRequired = createAsyncThunk(
  "reports/fetchActionRequired",
  async (licenceTypeId, thunkApi) => {
    try {
      const response = await Api.get(`reports/actionRequired/${licenceTypeId}`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const startActionRequiredJob = createAsyncThunk(
  "reports/startActionRequiredJob",
  async (licenceTypeId, thunkApi) => {
    try {
      const response = await Api.post(
        `documents/reports/startJob/actionRequired/${licenceTypeId}`
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

export const generateActionRequiredReport = createAsyncThunk(
  "reports/generateActionRequiredReport",
  async (documentId, thunkApi) => {
    try {
      const response = await Api.post(
        `documents/reports/generate/actionRequired/${documentId}`
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

export const fetchReportJob = createAsyncThunk(
  "reports/fetchReportJob",
  async (_, thunkApi) => {
    try {
      const job = selectReportsJob(thunkApi.getState());
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

export const completeReportJob = createAsyncThunk(
  "reports/completeReportJob",
  async (jobId, thunkApi) => {
    try {
      const response = await Api.post(`documents/completeJob/${jobId}`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const reportsSlice = createSlice({
  name: "reports",
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
    clearQueuedReport: (state) => {
      state.queued.details = undefined;
      state.queued.error = undefined;
      state.queued.status = REQUEST_STATUS.IDLE;
    },
    clearReportsJob: (state) => {
      state.job.id = undefined;
      state.job.details = undefined;
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.IDLE;
    },
  },
  extraReducers: {
    [fetchActionRequired.pending]: (state) => {
      state.queued.error = undefined;
      state.queued.status = REQUEST_STATUS.PENDING;
    },
    [fetchActionRequired.fulfilled]: (state, action) => {
      state.queued.data = action.payload;
      state.queued.error = undefined;
      state.queued.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchActionRequired.rejected]: (state, action) => {
      state.queued.data = undefined;
      state.queued.error = action.payload;
      state.queued.status = REQUEST_STATUS.REJECTED;
    },
    [startActionRequiredJob.pending]: (state) => {
      state.job.status = REQUEST_STATUS.PENDING;
    },
    [startActionRequiredJob.fulfilled]: (state, action) => {
      state.job.id = action.payload.jobId;
      state.job.pendingDocuments = action.payload.documents;
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.FULFILLED;
    },
    [startActionRequiredJob.rejected]: (state, action) => {
      state.job.error = action.payload;
      state.job.status = REQUEST_STATUS.REJECTED;
    },
    [generateActionRequiredReport.fulfilled]: (state, action) => {
      state.job.pendingDocuments = state.job.pendingDocuments.filter(
        (document) => document.documentId !== action.payload.documentId
      );
    },
    [generateActionRequiredReport.rejected]: (state) => {
      state.job.pendingDocuments = { ...state.job.pendingDocuments };
    },
    [completeReportJob.pending]: (state) => {
      state.job.status = REQUEST_STATUS.PENDING;
    },
    [completeReportJob.fulfilled]: (state) => {
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.FULFILLED;
    },
    [completeReportJob.rejected]: (state, action) => {
      state.job.error = action.payload;
      state.job.status = REQUEST_STATUS.REJECTED;
    },
    [fetchReportJob.pending]: (state) => {
      state.job.status = REQUEST_STATUS.PENDING;
    },
    [fetchReportJob.fulfilled]: (state, action) => {
      state.job.details = action.payload;
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchReportJob.rejected]: (state, action) => {
      state.job.error = action.payload;
      state.job.status = REQUEST_STATUS.REJECTED;
    },
  },
});

const { actions, reducer } = reportsSlice;

export const { clearQueuedReport, clearReportsJob } = actions;

export default reducer;
