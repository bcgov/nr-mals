import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";

import licencesReducer from "../features/licences/licencesSlice";
import lookupsReducer from "../features/lookups/lookupsReducer";
import statusReducer from "../features/status/statusSlice";

const reducer = {
  licences: licencesReducer,
  lookups: lookupsReducer,
  status: statusReducer,
};

const middleware = [...getDefaultMiddleware()];

export default configureStore({
  reducer,
  middleware,
  devTools: process.env.NODE_ENV !== "production",
});
