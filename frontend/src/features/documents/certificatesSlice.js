import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS } from "../../utilities/constants";

export const selectQueuedCertificates = (state) => state.certificates.queued;
export const selectCertificateJob = (state) => state.certificates.job;

export const fetchQueuedCertificates = createAsyncThunk(
  "certificates/fetchQueued",
  async (_, thunkApi) => {
    try {
      const response = await Api.get("documents/certificates/queued");
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const startCertificateJob = createAsyncThunk(
  "certificates/startCertificateJob",
  async (licenceIds, thunkApi) => {
    try {
      const response = await Api.post(
        "documents/certificates/startJob",
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

export const completeCertificateJob = createAsyncThunk(
  "certificates/completeCertificateJob",
  async (jobId, thunkApi) => {
    try {
      const response = await Api.post(
        `documents/certificates/completeJob/${jobId}`
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

export const generateCertificate = createAsyncThunk(
  "certificates/generateCertificate",
  async (documentId, thunkApi) => {
    try {
      const response = await Api.post(
        `documents/certificates/generate/${documentId}`
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
  "certificates/fetchPendingDocuments",
  async (_, thunkApi) => {
    try {
      const job = selectCertificateJob(thunkApi.getState());
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

export const fetchCertificateJob = createAsyncThunk(
  "certificates/fetchCertificateJob",
  async (_, thunkApi) => {
    try {
      const job = selectCertificateJob(thunkApi.getState());
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

export const certificatesSlice = createSlice({
  name: "certificates",
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
    clearCertificateJob: (state) => {
      state.job.id = undefined;
      state.job.details = undefined;
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.IDLE;
    },
  },
  extraReducers: {
    [fetchQueuedCertificates.pending]: (state) => {
      state.queued.data = undefined;
      state.queued.status = REQUEST_STATUS.PENDING;
    },
    [fetchQueuedCertificates.fulfilled]: (state, action) => {
      state.queued.data = action.payload;
      state.queued.error = undefined;
      state.queued.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchQueuedCertificates.rejected]: (state, action) => {
      state.queued.data = undefined;
      state.queued.error = action.payload;
      state.queued.status = REQUEST_STATUS.REJECTED;
    },
    [startCertificateJob.pending]: (state) => {
      state.job.status = REQUEST_STATUS.PENDING;
    },
    [startCertificateJob.fulfilled]: (state, action) => {
      state.job.id = action.payload.jobId;
      state.job.pendingDocuments = action.payload.documents;
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.FULFILLED;
    },
    [startCertificateJob.rejected]: (state, action) => {
      state.job.error = action.payload;
      state.job.status = REQUEST_STATUS.REJECTED;
    },
    [completeCertificateJob.pending]: (state) => {
      state.job.status = REQUEST_STATUS.PENDING;
    },
    [completeCertificateJob.fulfilled]: (state) => {
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.FULFILLED;
    },
    [completeCertificateJob.rejected]: (state, action) => {
      state.job.error = action.payload;
      state.job.status = REQUEST_STATUS.REJECTED;
    },
    [generateCertificate.fulfilled]: (state, action) => {
      state.job.pendingDocuments = state.job.pendingDocuments.filter(
        (document) => document.documentId !== action.payload.documentId
      );
    },
    [generateCertificate.rejected]: (state) => {
      state.job.pendingDocuments = { ...state.job.pendingDocuments };
    },
    [fetchCertificateJob.pending]: (state) => {
      state.job.status = REQUEST_STATUS.PENDING;
    },
    [fetchCertificateJob.fulfilled]: (state, action) => {
      state.job.details = action.payload;
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchCertificateJob.rejected]: (state, action) => {
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

const { actions, reducer } = certificatesSlice;

export const { clearCertificateJob } = actions;

export default reducer;
