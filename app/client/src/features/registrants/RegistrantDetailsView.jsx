import React from "react";
import PropTypes from "prop-types";
import NumberFormat from "react-number-format";
import { Col, Row } from "react-bootstrap";

import VerticalField from "../../components/VerticalField";

export default function RegistrantDetailsView({ registrant }) {
  return (
    <>
      <Row className="mt-3">
        <Col lg={4}>
          <VerticalField label="First Name" value={registrant.firstName} />
        </Col>
        <Col lg={4}>
          <VerticalField label="Last Name" value={registrant.lastName} />
        </Col>
        <Col lg={4}>
          <VerticalField
            label="Official Title"
            value={registrant.officialTitle}
          />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={4}>
          <VerticalField label="Company Name" value={registrant.companyName} />
        </Col>
        <Col lg={4}>
          <VerticalField
            label="Primary Phone"
            value={
              <NumberFormat
                displayType="text"
                format="(###) ###-####"
                value={registrant.primaryPhone}
              />
            }
          />
        </Col>
        <Col lg={4}>
          <VerticalField label="Email" value={registrant.email} />
        </Col>
      </Row>
    </>
  );
}

RegistrantDetailsView.propTypes = {
  registrant: PropTypes.object.isRequired,
};
