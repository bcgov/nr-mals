import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";

import userReducer from "./reducers/user";

const reducer = {
  user: userReducer,
};

const middleware = [...getDefaultMiddleware()];

export default configureStore({
  reducer,
  middleware,
  devTools: process.env.NODE_ENV !== "production",
});
