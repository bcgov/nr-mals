import React from "react";
import PropTypes from "prop-types";
import { Row, Col } from "react-bootstrap";

import {
  formatDateString,
  formatMoneyString,
  formatPhoneNumber,
} from "../../utilities/formatting.ts";

import VerticalField from "../../components/VerticalField";

export default function BondInformationView({ licence }) {
  return (
    <>
      <Row className="mt-3">
        <Col lg={4}>
          <VerticalField label="Bond Number" value={licence.bondNumber} />
        </Col>
        <Col lg={2} />
        <Col lg={4}>
          <VerticalField
            label="Value"
            value={formatMoneyString(licence.bondValue)}
          />
        </Col>
        <Col lg={2} />
      </Row>
      <Row className="mt-3">
        <Col lg={6}>
          <VerticalField label="Carrier Name" value={licence.bondCarrierName} />
        </Col>
        <Col lg={4}>
          <VerticalField
            label="Carrier Phone Number"
            value={formatPhoneNumber(licence.bondCarrierPhoneNumber)}
          />
        </Col>
        <Col lg={2} />
      </Row>
      <Row className="mt-3">
        <Col lg={4}>
          <VerticalField
            label="Continuation Expiry Date"
            value={formatDateString(licence.bondContinuationExpiryDate)}
          />
        </Col>
        <Col />
      </Row>
    </>
  );
}

BondInformationView.propTypes = {
  licence: PropTypes.object.isRequired,
};
