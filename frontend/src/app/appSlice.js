import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import Api, { ApiError } from "../utilities/api.ts";
import { REQUEST_STATUS } from "../utilities/constants";

const SHOW = "app/SHOW_MODAL";
const HIDE = "app/HIDE_MODAL";

export const openModal = (modalType, callback, data, modalSize = null) => ({
  type: SHOW,
  modalType,
  callback,
  data,
  modalSize,
});
export const closeModal = () => ({ type: HIDE });

export const fetchCurrentUser = createAsyncThunk(
  "app/fetchCurrentUser",
  async ({ data }, thunkApi) => {
    try {
      const response = await Api.post(`user/currentUser`, data);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkApi.rejectWithValue(error.serialize());
      }
      return thunkApi.rejectWithValue({ code: -1, description: error.message });
    }
  }
);

export const appSlice = createSlice({
  name: "app",
  initialState: {
    // modal props
    modal: {
      open: false,
      data: null,
      size: null,
      modalType: null,
      callback: null,
      status: REQUEST_STATUS.IDLE,
    },
    currentUser: {
      data: undefined,
      error: undefined,
      status: REQUEST_STATUS.IDLE,
    },
  },
  reducers: {
    SHOW_MODAL(state, action) {
      state.modal.open = true;
      state.modal.data = action.data || null;
      state.modal.modalSize = action.modalSize || null;
      state.modal.modalType = action.modalType || null;
      state.modal.callback = action.callback || null;
    },
    HIDE_MODAL(state) {
      state.modal.open = false;
      state.modal.data = null;
      state.modal.modalSize = null;
      state.modal.modalType = null;
      state.modal.callback = null;
    },
  },
  extraReducers: {
    [fetchCurrentUser.pending]: (state) => {
      state.currentUser.error = undefined;
      state.currentUser.status = REQUEST_STATUS.PENDING;
    },
    [fetchCurrentUser.fulfilled]: (state, action) => {
      state.currentUser.data = action.payload;
      state.currentUser.error = undefined;
      state.currentUser.status = REQUEST_STATUS.FULFILLED;
    },
    [fetchCurrentUser.rejected]: (state, action) => {
      state.currentUser.data = undefined;
      state.currentUser.error = action.payload;
      state.currentUser.status = REQUEST_STATUS.REJECTED;
    },
  },
});

export const selectModal = (state) => state.app.modal;

export const selectCurrentUser = (state) => state.app.currentUser;

const { actions, reducer } = appSlice;

export const { SHOW_MODAL, HIDE_MODAL } = actions;

export default reducer;
