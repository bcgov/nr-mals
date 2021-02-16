import React from "react";
import PropTypes from "prop-types";
import { Col, Row } from "react-bootstrap";

import VerticalField from "../../../components/VerticalField";
import { formatDateString } from "../../../utilities/formatting";

export default function DairyTankDetailsView({ dairyTank }) {
  return (
    <>
      <Row className="mt-3">
        <Col lg={3}>
          <VerticalField
            label="Tank Calibration Date"
            value={formatDateString(dairyTank.calibrationDate)}
          />
        </Col>
        <Col lg={3}>
          <VerticalField label="Tank Issue Date" value={formatDateString(dairyTank.issueDate)} />
        </Col>
        <Col lg={3}>
          <VerticalField label="Recheck Year" value={dairyTank.recheckYear} />
        </Col>
        <Col lg={3}>
          <VerticalField label="Serial Number" value={dairyTank.serialNumber} />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={3}>
          <VerticalField label="Model Number" value={dairyTank.modelNumber} />
        </Col>
        <Col lg={3}>
          <VerticalField label="Capacity" value={dairyTank.capacity} />
        </Col>
        <Col lg={3}>
          <VerticalField label="Manufacturer" value={dairyTank.manufacturer} />
        </Col>
      </Row>
    </>
  );
}

DairyTankDetailsView.propTypes = {
  dairyTank: PropTypes.object.isRequired,
};
