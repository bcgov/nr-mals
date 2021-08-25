import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";

import appReducer from "./appSlice";
import licencesReducer from "../features/licences/licencesSlice";
import sitesReducer from "../features/sites/sitesSlice";
import lookupsReducer from "../features/lookups/lookupsReducer";
import statusReducer from "../features/status/statusSlice";
import searchReducer from "../features/search/searchSlice";
import commentsReducer from "../features/comments/commentsSlice";
import certificatesReducer from "../features/documents/certificatesSlice";
import renewalsReducer from "../features/documents/renewalsSlice";
import dairyNoticesReducer from "../features/documents/dairyNoticesSlice";
import dairyTankNoticesReducer from "../features/documents/dairyTankNoticesSlice";
import adminReducer from "../features/admin/adminSlice";
import reportsReducer from "../features/reports/reportsSlice";
import inspectionsReducer from "../features/inspections/inspectionsSlice";

const reducer = {
  admin: adminReducer,
  app: appReducer,
  certificates: certificatesReducer,
  renewals: renewalsReducer,
  dairyNotices: dairyNoticesReducer,
  dairyTankNotices: dairyTankNoticesReducer,
  comments: commentsReducer,
  inspections: inspectionsReducer,
  licences: licencesReducer,
  lookups: lookupsReducer,
  reports: reportsReducer,
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
