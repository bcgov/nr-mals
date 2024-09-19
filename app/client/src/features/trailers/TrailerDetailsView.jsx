import React from "react";
import PropTypes from "prop-types";
import { Row, Col } from "react-bootstrap";
import { PatternFormat } from "react-number-format";

import VerticalField from "../../components/VerticalField";
import SectionHeading from "../../components/SectionHeading";

export default function TrailerDetailsView({ trailer }) {
  return (
    <>
      <Row className="mt-3">
        <Col lg={4}>
          <VerticalField label="Trailer Status" value="" />
        </Col>
        <Col lg={4}>
          <VerticalField label="Date Issued" value={trailer.dateIssued} />
        </Col>
        <Col lg={4}>
          <VerticalField label="Trailer #" value={trailer.trailerNumber} />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={4}>
          <VerticalField
            label="Division"
            value={trailer.geographicalDivision}
          />
        </Col>
        <Col lg={4}>
          <VerticalField
            label="Serial No. / VIN"
            value={trailer.serialNumberVIN}
          />
        </Col>
        <Col lg={4}>
          <VerticalField label="License Plate #" value={trailer.licencePlate} />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={4}>
          <VerticalField label="Year" value={trailer.trailerYear} />
        </Col>
        <Col lg={4}>
          <VerticalField label="Make" value={trailer.trailerMake} />
        </Col>
        <Col lg={4}>
          <VerticalField label="Trailer Type" value={trailer.trailerType} />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={4}>
          <VerticalField label="Capacity" value={trailer.trailerCapacity} />
        </Col>
        <Col lg={4}>
          <VerticalField
            label="Compartments"
            value={trailer.trailerCompartments}
          />
        </Col>
        <Col lg={4}></Col>
      </Row>

      {/* <SectionHeading>Site Contact Details</SectionHeading>
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
              <PatternFormat
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
              <PatternFormat
                displayType="text"
                format="(###) ###-####"
                value={site.secondaryPhone}
              />
            }
          />
        </Col>
        <Col lg={4}>
          <VerticalField label="Email" value={site.emailAddress} />
        </Col>
      </Row> */}
    </>
  );
}

TrailerDetailsView.propTypes = {
  trailer: PropTypes.object.isRequired,
  licenceTypeId: PropTypes.number,
};

TrailerDetailsView.defaultProps = {
  licenceTypeId: null,
};
