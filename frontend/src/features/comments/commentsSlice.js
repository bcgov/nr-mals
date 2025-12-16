import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../../utilities/api.ts";
import { REQUEST_STATUS } from "../../utilities/constants";

export const createComment = createAsyncThunk(
  "comments/createComment",
  async (comment, thunkApi) => {
    try {
      const response = await Api.post("comments", comment);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const updateComment = createAsyncThunk(
  "comments/updateComment",
  async ({ comment, id }, thunkApi) => {
    try {
      const response = await Api.put(`comments/${id}`, comment);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async (id, thunkApi) => {
    try {
      const response = await Api.get(`comments/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async (data, thunkApi) => {
    try {
      const response = await Api.put(
        `comments/delete/${data.licenceId}/${data.id}`
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

export const commentsSlice = createSlice({
  name: "comments",
  initialState: {
    comments: {
      data: undefined,
      error: undefined,
      status: REQUEST_STATUS.IDLE,
    },
  },
  reducers: {},
  extraReducers: {
    [createComment.pending]: (state) => {
      state.comments.error = undefined;
      state.comments.status = REQUEST_STATUS.PENDING;
    },
    [createComment.fulfilled]: (state, action) => {
      state.comments.data = action.payload;
      state.comments.error = undefined;
      state.comments.status = REQUEST_STATUS.FULFILLED;
    },
    [createComment.rejected]: (state, action) => {
      state.comments.data = undefined;
      state.comments.error = action.payload;
      state.comments.status = REQUEST_STATUS.REJECTED;
    },
    [updateComment.pending]: (state) => {
      state.comments.error = undefined;
      state.comments.status = REQUEST_STATUS.PENDING;
    },
    [updateComment.fulfilled]: (state, action) => {
      state.comments.data = action.payload;
      state.comments.error = undefined;
      state.comments.status = REQUEST_STATUS.FULFILLED;
    },
    [updateComment.rejected]: (state, action) => {
      state.comments.data = undefined;
      state.comments.error = action.payload;
      state.comments.status = REQUEST_STATUS.REJECTED;
    },
    [deleteComment.pending]: (state) => {
      state.comments.error = undefined;
      state.comments.status = REQUEST_STATUS.PENDING;
    },
    [deleteComment.fulfilled]: (state, action) => {
      state.comments.data = action.payload;
      state.comments.error = undefined;
      state.comments.status = REQUEST_STATUS.FULFILLED;
    },
    [deleteComment.rejected]: (state, action) => {
      state.comments.data = undefined;
      state.comments.error = action.payload;
      state.comments.status = REQUEST_STATUS.REJECTED;
    },
    [fetchComments.pending]: (state) => {
      state.comments.error = undefined;
      state.comments.status = REQUEST_STATUS.PENDING;
    },
    [fetchComments.fulfilled]: (state, action) => {
      state.comments.data = action.payload;
      state.comments.error = undefined;
      state.comments.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchComments.rejected]: (state, action) => {
      state.comments.data = undefined;
      state.comments.error = action.payload;
      state.comments.status = REQUEST_STATUS.REJECTED;
    },
  },
});

export const selectComments = (state) => state.comments.comments;

export default commentsSlice.reducer;
