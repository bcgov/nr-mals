import React from "react";
import PropTypes from "prop-types";
import { Tab } from "react-bootstrap";

import { REGISTRANT_STATUS } from "../../utilities/constants";
import RegistrantView from "./RegistrantView";

export default function RegistrantsView({ registrants }) {
  const activeRegistrants = registrants.filter(
    (r) =>
      r.status === REGISTRANT_STATUS.EXISTING ||
      r.status === REGISTRANT_STATUS.NEW
  );

  return (
    <>
      {activeRegistrants.map((registrant) => {
        return (
          <Tab.Pane key={registrant.key} eventKey={registrant.key}>
            <RegistrantView registrant={registrant} />
          </Tab.Pane>
        );
      })}
    </>
  );
}

RegistrantsView.propTypes = {
  registrants: PropTypes.arrayOf(PropTypes.object).isRequired,
};
