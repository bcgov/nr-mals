import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS } from "../../utilities/constants";

export const selectReportsJob = (state) => state.reports.job;

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

export const startProducersAnalysisCityJob = createAsyncThunk(
  "reports/startProducersAnalysisCityJob",
  async (_, thunkApi) => {
    try {
      const response = await Api.post(
        `documents/reports/startJob/producersAnalysisCity`
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

export const startProvincialFarmQualityJob = createAsyncThunk(
  "reports/startProvincialFarmQuality",
  async (payload, thunkApi) => {
    try {
      const response = await Api.post(
        `documents/reports/startJob/provincialFarmQuality`,
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

export const startLicenceTypeLocationJob = createAsyncThunk(
  "reports/startLicenceTypeLocationJob",
  async (payload, thunkApi) => {
    try {
      const response = await Api.post(
        `documents/reports/startJob/licenceTypeLocation`,
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

const pendingStartJobReducer = (state, { payload }) => {
  state.job.status = REQUEST_STATUS.PENDING;
};

const fulfilledStartJobReducer = (state, { payload }) => {
  state.job.id = payload.jobId;
  state.job.type = payload.type;
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
    job: {
      id: undefined,
      type: undefined,
      details: undefined,
      pendingDocuments: undefined,
      error: undefined,
      status: REQUEST_STATUS.IDLE,
    },
  },
  reducers: {
    clearReportsJob: (state) => {
      state.job.id = undefined;
      state.job.type = undefined;
      state.job.details = undefined;
      state.job.error = undefined;
      state.job.status = REQUEST_STATUS.IDLE;
    },
  },
  extraReducers: {
    [startActionRequiredJob.pending]: pendingStartJobReducer,
    [startActionRequiredJob.fulfilled]: fulfilledStartJobReducer,
    [startActionRequiredJob.rejected]: rejectionStartJobReducer,
    [startApiaryHiveInspectionJob.pending]: pendingStartJobReducer,
    [startApiaryHiveInspectionJob.fulfilled]: fulfilledStartJobReducer,
    [startApiaryHiveInspectionJob.rejected]: rejectionStartJobReducer,
    [startProducersAnalysisRegionJob.pending]: pendingStartJobReducer,
    [startProducersAnalysisRegionJob.fulfilled]: fulfilledStartJobReducer,
    [startProducersAnalysisRegionJob.rejected]: rejectionStartJobReducer,
    [startProducersAnalysisDistrictJob.pending]: pendingStartJobReducer,
    [startProducersAnalysisDistrictJob.fulfilled]: fulfilledStartJobReducer,
    [startProducersAnalysisDistrictJob.rejected]: rejectionStartJobReducer,
    [startProducersAnalysisCityJob.pending]: pendingStartJobReducer,
    [startProducersAnalysisCityJob.fulfilled]: fulfilledStartJobReducer,
    [startProducersAnalysisCityJob.rejected]: rejectionStartJobReducer,
    [startProvincialFarmQualityJob.pending]: pendingStartJobReducer,
    [startProvincialFarmQualityJob.fulfilled]: fulfilledStartJobReducer,
    [startProvincialFarmQualityJob.rejected]: rejectionStartJobReducer,
    [startLicenceTypeLocationJob.pending]: pendingStartJobReducer,
    [startLicenceTypeLocationJob.fulfilled]: fulfilledStartJobReducer,
    [startLicenceTypeLocationJob.rejected]: rejectionStartJobReducer,

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

export const { clearReportsJob } = actions;

export default reducer;
