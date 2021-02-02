import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";

import appReducer from "../app/appSlice";
import licencesReducer from "../features/licences/licencesSlice";
import sitesReducer from "../features/sites/sitesSlice";
import lookupsReducer from "../features/lookups/lookupsReducer";
import statusReducer from "../features/status/statusSlice";
import cdogsReducer from "../features/reports/cdogsSlice";
import searchReducer from "../features/search/searchSlice";
import commentsReducer from "../features/comments/commentsSlice";

const reducer = {
  app: appReducer,
  licences: licencesReducer,
  sites: sitesReducer,
  lookups: lookupsReducer,
  status: statusReducer,
  cdogs: cdogsReducer,
  search: searchReducer,
  comments: commentsReducer,
};

const middleware = [
  ...getDefaultMiddleware({
    serializableCheck: {
      // Ignore these action types
      ignoredActions: ["app/SHOW_MODAL"],
    },
  }),
];

export default configureStore({
  reducer,
  middleware,
  devTools: process.env.NODE_ENV !== "production",
});
