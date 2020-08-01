import { combineReducers } from "react-redux";

import userReducer from "./user";

export default combineReducers({
  user: userReducer,
});
