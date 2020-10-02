import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";

import { REQUEST_STATUS } from "../../utilities/constants";
import {
  formatDateString,
  formatDateTimeString,
  formatMoney,
  formatBoolean,
} from "../../utilities/formatting.ts";

import HorizontalField from "../../components/HorizontalField";
import VerticalField from "../../components/VerticalField";
import PageHeading from "../../components/PageHeading";
import SectionHeading from "../../components/SectionHeading";

import { fetchLicence, selectCurrentLicence } from "./licencesSlice";

import "./LicencesView.scss";

export default function LicencesView() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const licence = useSelector(selectCurrentLicence);

  useEffect(() => {
    dispatch(fetchLicence(id));
  }, [dispatch, id]);

  const pageHeading = <PageHeading>Licence and Registrant Details</PageHeading>;

  if (licence.data === undefined) {
    let content = null;
    if (
      licence.status === REQUEST_STATUS.IDLE ||
      licence.status === REQUEST_STATUS.PENDING
    ) {
      content = (
        <Spinner animation="border" role="status" variant="primary">
          <span className="sr-only">Loading...</span>
        </Spinner>
      );
    } else {
      content = (
        <Alert variant="danger">
          <Alert.Heading>
            An error was encountered while loading the licence.
          </Alert.Heading>
          <p>{`${licence.error.code}: ${licence.error.description}`}</p>
        </Alert>
      );
    }

    return (
      <section>
        {pageHeading}
        {content}
      </section>
    );
  }

  return (
    <section>
      {pageHeading}
      <header>
        <Container className="mt-3 pb-3">
          <Row>
            <HorizontalField
              label="Licence Number"
              value={licence.data.licenceNumber}
            />
            <div className="w-100 d-xl-none" />
            <HorizontalField
              label="Created By"
              value={licence.data.createdBy}
            />
            <div className="w-100 d-xl-none" />
            <HorizontalField
              label="Created On"
              value={formatDateTimeString(licence.data.createdOn)}
            />
            <div className="w-100" />
            <HorizontalField
              label="Licence Type"
              value={licence.data.licenceType}
            />
            <div className="w-100 d-xl-none" />
            <HorizontalField
              label="Last Changed By"
              value={licence.data.updatedBy}
            />
            <div className="w-100 d-xl-none" />
            <HorizontalField
              label="Last Changed On"
              value={formatDateTimeString(licence.data.updatedOn)}
            />
          </Row>
        </Container>
      </header>
      <section>
        <Container>
          <SectionHeading>License Details</SectionHeading>
          <Row className="mt-3">
            <Col lg={6}>
              <VerticalField
                label="Application Date"
                value={formatDateString(licence.data.applicationDate)}
              />
            </Col>
            <Col lg={6}>
              <VerticalField label="Region" value={licence.data.region} />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col lg={6}>
              <VerticalField
                label="Issued On"
                value={formatDateString(licence.data.issuedOnDate)}
              />
            </Col>
            <Col lg={6}>
              <VerticalField
                label="District"
                value={licence.data.regionalDistrict}
              />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col lg={6}>
              <VerticalField
                label="Expiry Date"
                value={formatDateString(licence.data.expiryDate)}
              />
            </Col>
            <Col lg={6}>
              <VerticalField
                label="Licence Status"
                value={licence.data.licenceStatus}
              />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col lg={6}>
              <VerticalField
                label="Payment Received"
                value={formatBoolean(licence.data.paymentReceived)}
              />
            </Col>
            {licence.data.paymentReceived && (
              <Col lg={6}>
                <VerticalField
                  label="Fee Paid Amount"
                  value={formatMoney(licence.data.feePaidAmount)}
                />
              </Col>
            )}
          </Row>
          <Row className="mt-3">
            <Col lg={6}>
              <VerticalField
                label="Action Required"
                value={formatBoolean(licence.data.actionRequired)}
              />
            </Col>
            <Col lg={6}>
              <VerticalField
                label="Renewal Notice"
                value={formatBoolean(licence.data.renewalNotice)}
              />
            </Col>
          </Row>
        </Container>
      </section>
    </section>
  );
}
