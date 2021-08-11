import React from "react";
import PropTypes from "prop-types";
import { Form, Row, Col } from "react-bootstrap";

import SectionHeading from "../../components/SectionHeading";
import VerticalField from "../../components/VerticalField";

export default function ApiaryInspectionDetailsView({ inspection, site }) {
  return (
    <>
      <Row className="mt-3">
        <Col lg={3}>
          <VerticalField label="Apiary Site ID" value={site.apiarySiteId} />
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
        <Col lg={3}>
          <VerticalField
            label="Inspector Name"
            value={inspection.inspectorName}
          />
        </Col>
      </Row>
      <Row>
        <Col lg={3}>
          <VerticalField
            label="Live Colonies in Yard"
            value={inspection.liveColonies}
          />
        </Col>
        <Col lg={3}>
          <VerticalField
            label="Number of Colonies Tested"
            value={inspection.coloniesTested}
          />
        </Col>
        <Col lg={2}>
          <VerticalField label="Brood" value={inspection.broodTested} />
        </Col>
        <Col lg={2}>
          <VerticalField label="Varroa" value={inspection.varroaTested} />
        </Col>
        <Col lg={2}>
          <VerticalField label="SHB" value={inspection.smallHiveBeetleTested} />
        </Col>
      </Row>
      <section>
        <SectionHeading>Test Results</SectionHeading>
      </section>
      <Row>
        <Col lg={6}>
          <Row>
            <Col lg={4}>
              <VerticalField
                label="AFB"
                value={inspection.americanFoulbroodResult}
              />
            </Col>
            <Col lg={4}>
              <VerticalField
                label="EFB"
                value={inspection.europeanFoulbroodResult}
              />
            </Col>
            <Col lg={4}>
              <VerticalField
                label="SHB"
                value={inspection.smallHiveBeetleResult}
              />
            </Col>
          </Row>
          <Row>
            <Col lg={4}>
              <VerticalField
                label="Chalkbrood"
                value={inspection.chalkbroodResult}
              />
            </Col>
            <Col lg={4}>
              <VerticalField
                label="Sacbrood"
                value={inspection.sacbroodResult}
              />
            </Col>
            <Col lg={4}>
              <VerticalField label="Nosema" value={inspection.nosemaResult} />
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <VerticalField
                label="Varroa Mites"
                value={inspection.varroaMiteResult}
              />
            </Col>
            <Col lg={6}>
              <VerticalField
                label="Varroa Mites (%)"
                value={inspection.varroaMiteResultPercent}
              />
            </Col>
          </Row>
        </Col>
        <Col lg={6}>
          <Form.Group controlId="otherResultDescription">
            <Form.Label>Other</Form.Label>
            <Form.Control
              disabled
              value={inspection.otherResultDescription}
              as="textarea"
              rows={8}
              name="otherResultDescription"
              maxLength={240}
              className="mb-1"
            />
          </Form.Group>
        </Col>
      </Row>
      <SectionHeading>Equipment Inspected</SectionHeading>
      <Row>
        <Col lg={3}>
          <VerticalField
            label="Supers Inspected"
            value={inspection.supersInspected}
          />
        </Col>
        <Col />
        <Col lg={3}>
          <VerticalField
            label="Supers Destroyed"
            value={inspection.supersDestroyed}
          />
        </Col>
        <Col />
      </Row>
      <SectionHeading>Comments</SectionHeading>
      <Row>
        <Col lg={12}>
          <Form.Control
            disabled
            value={inspection.inspectionComment}
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

ApiaryInspectionDetailsView.propTypes = {
  inspection: PropTypes.object.isRequired,
  site: PropTypes.object.isRequired,
};
