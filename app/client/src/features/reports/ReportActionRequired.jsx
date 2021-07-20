import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Form, Row, Col, Button } from "react-bootstrap";
import LicenceTypes from "../lookups/LicenceTypes";

export default function ReportActionRequired() {
  const dispatch = useDispatch();

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, watch } = form;

  const selectedLicenceType = watch("licenceType", null);

  useEffect(() => {}, [dispatch]);

  const onGenerateReport = () => {
    console.log(`generating report for ${selectedLicenceType}`);
  };

  return (
    <>
      <Row>
        <Col sm={4}>
          <LicenceTypes
            ref={register}
            defaultValue={null}
            allowAny
            label="Select a Licence Type"
          />
        </Col>
      </Row>
      <Row>
        <Col sm={2}>
          <Button
            variant="primary"
            type="button"
            onClick={() => onGenerateReport()}
            disabled={!selectedLicenceType}
          >
            Generate Report
          </Button>
        </Col>
      </Row>
    </>
  );
}

ReportActionRequired.propTypes = {};
