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

export const fetchApiaryHiveInspection = createAsyncThunk(
  "reports/fetchApiaryHiveInspection",
  async (payload, thunkApi) => {
    try {
      const response = await Api.post(`reports/apiaryHiveInspection`, payload);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const startApiaryHiveInspectionJob = createAsyncThunk(
  "reports/startApiaryHiveInspection",
  async (payload, thunkApi) => {
    try {
      const response = await Api.post(
        `documents/reports/startJob/apiaryHiveInspection`,
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

export const fetchProducersAnalysis = createAsyncThunk(
  "reports/fetchProducersAnalysis",
  async (payload, thunkApi) => {
    try {
      const response = await Api.post(`reports/producersAnalysis`, payload);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const startProducersAnalysisRegionJob = createAsyncThunk(
  "reports/startProducersAnalysisRegionJob",
  async (_, thunkApi) => {
    try {
      const response = await Api.post(
        `documents/reports/startJob/producersAnalysisRegion`
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

export const startProducersAnalysisDistrictJob = createAsyncThunk(
  "reports/startProducersAnalysisDistrictJob",
  async (_, thunkApi) => {
    try {
      const response = await Api.post(
        `documents/reports/startJob/producersAnalysisDistrict`
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

export const generateReport = createAsyncThunk(
  "reports/generateReport",
  async (documentId, thunkApi) => {
    try {
      const response = await Api.post(
        `documents/reports/generate/${documentId}`
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

const pendingFetchReducer = (state, { payload }) => {
  state.queued.error = undefined;
  state.queued.status = REQUEST_STATUS.PENDING;
};

const fulfilledFetchReducer = (state, { payload }) => {
  state.queued.data = payload;
  state.queued.error = undefined;
  state.queued.status = REQUEST_STATUS.FULFILLED;
};

const rejectionFetchReducer = (state, { payload }) => {
  state.queued.data = undefined;
  state.queued.error = payload;
  state.queued.status = REQUEST_STATUS.REJECTED;
};

const pendingStartJobReducer = (state, { payload }) => {
  state.job.status = REQUEST_STATUS.PENDING;
};

const fulfilledStartJobReducer = (state, { payload }) => {
  state.job.id = payload.jobId;
  state.job.pendingDocuments = payload.documents;
  state.job.error = undefined;
  state.job.status = REQUEST_STATUS.FULFILLED;
};

const rejectionStartJobReducer = (state, { payload }) => {
  state.job.error = payload;
  state.job.status = REQUEST_STATUS.REJECTED;
};

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
    [fetchActionRequired.pending]: pendingFetchReducer,
    [fetchActionRequired.fulfilled]: fulfilledFetchReducer,
    [fetchActionRequired.rejected]: rejectionFetchReducer,
    [startActionRequiredJob.pending]: pendingStartJobReducer,
    [startActionRequiredJob.fulfilled]: fulfilledStartJobReducer,
    [startActionRequiredJob.rejected]: rejectionStartJobReducer,
    [fetchApiaryHiveInspection.pending]: pendingFetchReducer,
    [fetchApiaryHiveInspection.fulfilled]: fulfilledFetchReducer,
    [fetchApiaryHiveInspection.rejected]: rejectionFetchReducer,
    [startApiaryHiveInspectionJob.pending]: pendingStartJobReducer,
    [startApiaryHiveInspectionJob.fulfilled]: fulfilledStartJobReducer,
    [startApiaryHiveInspectionJob.rejected]: rejectionStartJobReducer,
    [fetchProducersAnalysis.pending]: pendingFetchReducer,
    [fetchProducersAnalysis.fulfilled]: fulfilledFetchReducer,
    [fetchProducersAnalysis.rejected]: rejectionFetchReducer,
    [startProducersAnalysisRegionJob.pending]: pendingStartJobReducer,
    [startProducersAnalysisRegionJob.fulfilled]: fulfilledStartJobReducer,
    [startProducersAnalysisRegionJob.rejected]: rejectionStartJobReducer,
    [startProducersAnalysisDistrictJob.pending]: pendingStartJobReducer,
    [startProducersAnalysisDistrictJob.fulfilled]: fulfilledStartJobReducer,
    [startProducersAnalysisDistrictJob.rejected]: rejectionStartJobReducer,

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
    [generateReport.fulfilled]: (state, action) => {
      state.job.pendingDocuments = state.job.pendingDocuments.filter(
        (document) => document.documentId !== action.payload.documentId
      );
    },
    [generateReport.rejected]: (state) => {
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
  },
});

const { actions, reducer } = reportsSlice;

export const { clearQueuedReport, clearReportsJob } = actions;

export default reducer;
