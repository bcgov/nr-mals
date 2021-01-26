import { createSlice } from "@reduxjs/toolkit";

import {
  REQUEST_STATUS,
} from "./../utilities/constants";

const SHOW = 'app/SHOW_MODAL';
const HIDE = 'app/HIDE_MODAL';

export const openModal = (modalType, callback, data, modalSize = null) => ({ type: SHOW, modalType, callback, data, modalSize });
export const closeModal = () => ({ type: HIDE });

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
    }
  },
  reducers: {
    SHOW_MODAL(state, action) {
        state.modal.open = true;
        state.modal.data = action.data || null;
        state.modal.modalSize = action.modalSize || null;
        state.modal.modalType = action.modalType || null;
        state.modal.callback = action.callback || null;
    },
    HIDE_MODAL(state, action) {
        state.modal.open = false;
        state.modal.data = null;
        state.modal.modalSize = null;
        state.modal.modalType = null;
        state.modal.callback = null;
    },
  },
  extraReducers: {
  },
});

export const selectModal = (state) => state.app.modal;

const { actions, reducer } = appSlice;

export const {
    SHOW_MODAL,
    HIDE_MODAL,
} = actions;

export default reducer;

