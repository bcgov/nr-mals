import { combineReducers } from "redux";

import licenceTypesReducer from "./licenceTypesSlice";
import licenceStatusesReducer from "./licenceStatusesSlice";
import regionsReducer from "./regionsSlice";
import gameFarmReducer from "./gameFarmSlice";
import furFarmReducer from "./furFarmSlice";

export default combineReducers({
  licenceTypes: licenceTypesReducer,
  licenceStatuses: licenceStatusesReducer,
  regions: regionsReducer,
  gameFarm: gameFarmReducer,
  furFarm: furFarmReducer,
});
