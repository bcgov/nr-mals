import { combineReducers } from "redux";

import licenceTypesReducer from "./licenceTypesSlice";
import licenceStatusesReducer from "./licenceStatusesSlice";

export default combineReducers({
  licenceTypes: licenceTypesReducer,
  licenceStatuses: licenceStatusesReducer,
});
