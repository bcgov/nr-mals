import React from "react";
import { useForm } from "react-hook-form";
import { Container, Form, Row, Col } from "react-bootstrap";

import PageHeading from "../../components/PageHeading";

import { REPORTS_OPTIONS } from "../../utilities/constants";

import ReportActionRequired from "./ReportActionRequired";

export default function Reports() {
  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, watch } = form;

  const selectedConfig = watch("selectedConfig", null);

  let control = null;
  switch (selectedConfig) {
    case REPORTS_OPTIONS.ACTION_REQUIRED:
      control = <ReportActionRequired />;
      break;
    default:
      break;
  }

  return (
    <>
      <PageHeading>Reports</PageHeading>
      <Container className="mt-3 mb-4">
        <Row>
          <Col sm={3}>
            <Form.Label>Select a Report</Form.Label>
            <Form.Control
              as="select"
              name="selectedConfig"
              ref={register}
              defaultValue={null}
            >
              <option value={null} />
              <option value={REPORTS_OPTIONS.ACTION_REQUIRED}>
                Action Required
              </option>
            </Form.Control>
          </Col>
        </Row>
        <div className="mt-3">{control}</div>
      </Container>
    </>
  );
}

Reports.propTypes = {};
