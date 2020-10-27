import React from "react";
import PropTypes from "prop-types";
import { Row, Col } from "react-bootstrap";

import {
  formatDateString,
  formatMoney,
  formatBoolean,
} from "../../utilities/formatting.ts";

import VerticalField from "../../components/VerticalField";

export default function LicenceDetailsView({ licence }) {
  return (
    <>
      <Row className="mt-3">
        <Col lg={4}>
          <VerticalField
            label="Application Date"
            value={formatDateString(licence.applicationDate)}
          />
        </Col>
        <Col lg={8}>
          <VerticalField label="Region" value={licence.region} />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={4}>
          <VerticalField
            label="Issued On"
            value={formatDateString(licence.issuedOnDate)}
          />
        </Col>
        <Col lg={8}>
          <VerticalField label="District" value={licence.regionalDistrict} />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={4}>
          <VerticalField
            label="Expiry Date"
            value={formatDateString(licence.expiryDate)}
          />
        </Col>
        <Col lg={8}>
          <VerticalField label="Licence Status" value={licence.licenceStatus} />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={4}>
          <VerticalField
            label="Payment Received"
            value={formatBoolean(licence.paymentReceived)}
          />
        </Col>
        {licence.paymentReceived && (
          <Col lg={4}>
            <VerticalField
              label="Fee Paid Amount"
              value={formatMoney(licence.feePaidAmount)}
            />
          </Col>
        )}
      </Row>
      <Row className="mt-3">
        <Col lg={6}>
          <VerticalField
            label="Action Required"
            value={formatBoolean(licence.actionRequired)}
          />
        </Col>
        <Col lg={6}>
          <VerticalField
            label="Renewal Notice"
            value={formatBoolean(licence.renewalNotice)}
          />
        </Col>
      </Row>
    </>
  );
}

LicenceDetailsView.propTypes = {
  licence: PropTypes.object.isRequired,
};
