import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";

import statusReducer from "../features/status/statusSlice";

const reducer = {
  status: statusReducer,
};

const middleware = [...getDefaultMiddleware()];

export default configureStore({
  reducer,
  middleware,
  devTools: process.env.NODE_ENV !== "production",
});
