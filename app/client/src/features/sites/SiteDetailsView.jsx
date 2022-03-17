/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Form, Row, Col, InputGroup } from "react-bootstrap";
import NumberFormat from "react-number-format";
import {
  formatDateString,
  formatMoney,
  formatBoolean,
} from "../../utilities/formatting.ts";

import {
  LICENCE_TYPE_ID_APIARY,
  LICENCE_TYPE_ID_GAME_FARM,
} from "../licences/constants";

import VerticalField from "../../components/VerticalField";
import SectionHeading from "../../components/SectionHeading";

export default function SiteDetailsView({ site, licenceTypeId }) {
  return (
    <>
      <Row className="mt-3">
        <Col lg={4}>
          <VerticalField label="Site Status" value={site.siteStatus} />
        </Col>
        <Col lg={4}>
          <VerticalField label="Region" value={site.region} />
        </Col>
        <Col lg={4}>
          <VerticalField label="District" value={site.regionalDistrict} />
        </Col>
      </Row>
      {licenceTypeId === LICENCE_TYPE_ID_APIARY ? (
        <Row className="mt-3">
          <Col lg={4}>
            <VerticalField label="Number of Hives" value={site.hiveCount} />
          </Col>
          <Col lg={4}>
            <VerticalField label="Premises ID" value={site.premisesId} />
          </Col>
        </Row>
      ) : null}
      <Row className="mt-3">
        <Col lg={4}>
          <VerticalField label="Address (Line 1)" value={site.addressLine1} />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={8}>
          <VerticalField label="Address (Line 2)" value={site.addressLine2} />
        </Col>
        <Col lg={4}>
          <VerticalField label="City" value={site.city} />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={2}>
          <VerticalField label="Province" value={site.province} />
        </Col>
        <Col lg={2}>
          <VerticalField label="Postal Code" value={site.postalCode} />
        </Col>
        <Col lg={4}>
          <VerticalField label="Country" value={site.country} />
        </Col>
        <Col lg={2}>
          <VerticalField label="Lat" value={site.latitude} />
        </Col>
        <Col lg={2}>
          <VerticalField label="Long" value={site.longitude} />
        </Col>
      </Row>

      <SectionHeading>Site Contact Details</SectionHeading>
      <Row className="mt-3">
        <Col lg={4}>
          <VerticalField label="First Name" value={site.firstName} />
        </Col>
        <Col lg={4}>
          <VerticalField label="Last Name" value={site.lastName} />
        </Col>
        <Col lg={4}>
          <VerticalField
            label="Primary Phone"
            value={
              <NumberFormat
                displayType="text"
                format="(###) ###-####"
                value={site.primaryPhone}
              />
            }
          />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={4}>
          <VerticalField
            label="Secondary Phone"
            value={
              <NumberFormat
                displayType="text"
                format="(###) ###-####"
                value={site.secondaryPhone}
              />
            }
          />
        </Col>
        <Col lg={4}>
          <VerticalField label="Email" value={site.email} />
        </Col>
      </Row>
      {licenceTypeId === LICENCE_TYPE_ID_GAME_FARM ? (
        <Row className="mt-3">
          <Col>
            <Form.Group controlId="legalDescription">
              <Form.Label>Legal Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                name="legalDescriptionText"
                disabled
                defaultValue={site.legalDescriptionText}
                className="mb-1"
              />
            </Form.Group>
          </Col>
        </Row>
      ) : null}
    </>
  );
}

SiteDetailsView.propTypes = {
  site: PropTypes.object.isRequired,
  licenceTypeId: PropTypes.number,
};

SiteDetailsView.defaultProps = {
  licenceTypeId: null,
};
