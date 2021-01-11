import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";

import licencesReducer from "../features/licences/licencesSlice";
import lookupsReducer from "../features/lookups/lookupsReducer";
import statusReducer from "../features/status/statusSlice";
import cdogsReducer from "../features/reports/cdogsSlice";
import searchReducer from "../features/search/searchSlice";
import commentsReducer from "../features/comments/commentsSlice";

const reducer = {
  licences: licencesReducer,
  lookups: lookupsReducer,
  status: statusReducer,
  cdogs: cdogsReducer,
  search: searchReducer,
  comments: commentsReducer,
};

const middleware = [...getDefaultMiddleware()];

export default configureStore({
  reducer,
  middleware,
  devTools: process.env.NODE_ENV !== "production",
});
