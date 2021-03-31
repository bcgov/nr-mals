import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";

import appReducer from "./appSlice";
import licencesReducer from "../features/licences/licencesSlice";
import sitesReducer from "../features/sites/sitesSlice";
import lookupsReducer from "../features/lookups/lookupsReducer";
import statusReducer from "../features/status/statusSlice";
import searchReducer from "../features/search/searchSlice";
import commentsReducer from "../features/comments/commentsSlice";
import certificatesReducer from "../features/documents/certificatesSlice";
import adminReducer from "../features/admin/adminSlice";

const reducer = {
  admin: adminReducer,
  app: appReducer,
  certificates: certificatesReducer,
  comments: commentsReducer,
  licences: licencesReducer,
  lookups: lookupsReducer,
  search: searchReducer,
  sites: sitesReducer,
  status: statusReducer,
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
