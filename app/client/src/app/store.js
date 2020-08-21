import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";

import statusReducer from "../features/status/statusSlice";
import lookupsReducer from "../features/lookups/lookupsReducer";

const reducer = {
  status: statusReducer,
  lookups: lookupsReducer,
};

const middleware = [...getDefaultMiddleware()];

export default configureStore({
  reducer,
  middleware,
  devTools: process.env.NODE_ENV !== "production",
});
