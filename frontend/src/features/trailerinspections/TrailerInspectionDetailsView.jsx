import React from "react";
import PropTypes from "prop-types";
import { Form, Row, Col } from "react-bootstrap";

import SectionHeading from "../../components/SectionHeading";
import VerticalField from "../../components/VerticalField";

export default function TrailerInspectionDetailsView({ inspection, trailer }) {
  return (
    <>
      <Row className="mt-3">
        <Col lg={3}>
          <VerticalField
            label="Dairy Trailer ID"
            value={trailer.licenceTrailerSeq}
          />
        </Col>
        <Col lg={3}>
          <VerticalField
            label="Date Inspected"
            value={inspection.inspectionDate}
          />
        </Col>
        <Col lg={3}>
          <VerticalField label="Inspector ID" value={inspection.inspectorId} />
        </Col>
      </Row>
      <SectionHeading>Comments</SectionHeading>
      <Row>
        <Col lg={12}>
          <Form.Control
            disabled
            value={inspection.inspectionComment ?? ""}
            as="textarea"
            rows={6}
            maxLength={2000}
            name="inspectionComment"
            className="mb-1"
          />
        </Col>
      </Row>
    </>
  );
}

TrailerInspectionDetailsView.propTypes = {
  inspection: PropTypes.object.isRequired,
  trailer: PropTypes.object.isRequired,
};
