import { combineReducers } from "redux";

import licenceTypesReducer from "./licenceTypesSlice";

export default combineReducers({ licenceTypes: licenceTypesReducer });
