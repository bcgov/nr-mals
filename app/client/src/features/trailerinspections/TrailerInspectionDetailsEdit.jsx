import React from "react";
import PropTypes from "prop-types";
import { Form, Row, Col } from "react-bootstrap";

import CustomDatePicker from "../../components/CustomDatePicker";
import SectionHeading from "../../components/SectionHeading";

export default function TrailerInspectionDetailsEdit({
  form,
  initialValues,
  trailer,
}) {
  const {
    setValue,
    register,
    formState: { errors },
  } = form;

  const handleFieldChange = (field) => {
    return (value) => {
      setValue(field, value);
    };
  };

  return (
    <>
      <Row className="mt-3">
        <Col lg={3}>
          <Form.Group controlId="trailerNumber">
            <Form.Label>Dairy Trailer ID</Form.Label>
            <Form.Control
              type="text"
              name="trailerNumber"
              defaultValue={trailer.trailerNumber}
              readOnly
            />
          </Form.Group>
        </Col>
        <Col lg={3}>
          <CustomDatePicker
            id="inspectionDate"
            label="Date Inspected"
            notifyOnChange={handleFieldChange("inspectionDate")}
            defaultValue={initialValues.inspectionDate}
            isInvalid={errors.inspectionDate}
          />
        </Col>
        <Col lg={3}>
          <Form.Group controlId="inspectorId">
            <Form.Label>Inspector ID</Form.Label>
            <Form.Control
              type="text"
              name="inspectorId"
              defaultValue={initialValues.inspectorId}
              {...register("inspectorId")}
              maxLength={10}
            />
          </Form.Group>
        </Col>
      </Row>
      <SectionHeading>Comments</SectionHeading>
      <Row>
        <Col lg={12}>
          <Form.Control
            as="textarea"
            rows={6}
            maxLength={2000}
            name="inspectionComment"
            defaultValue={initialValues.inspectionComment}
            {...register("inspectionComment")}
            className="mb-1"
          />
        </Col>
      </Row>
    </>
  );
}

TrailerInspectionDetailsEdit.propTypes = {
  form: PropTypes.object.isRequired,
  initialValues: PropTypes.object.isRequired,
  trailer: PropTypes.object.isRequired,
};
