import React from "react";
import PropTypes from "prop-types";
import { Tab } from "react-bootstrap";

import { DAIRY_TANK_STATUS } from "../../../utilities/constants";
import DairyTankDetailsView from "./DairyTankDetailsView";

export default function DairyTanksView({ dairyTanks }) {
  const activeDairyTanks = dairyTanks.filter(
    (r) =>
      r.status === DAIRY_TANK_STATUS.EXISTING ||
      r.status === DAIRY_TANK_STATUS.NEW
  );

  return (
    <>
      {activeDairyTanks.map((dairyTank) => {
        return (
          <Tab.Pane key={dairyTank.key} eventKey={dairyTank.key}>
            <DairyTankDetailsView dairyTank={dairyTank} />
          </Tab.Pane>
        );
      })}
    </>
  );
}

DairyTanksView.propTypes = {
  dairyTanks: PropTypes.arrayOf(PropTypes.object).isRequired,
};
