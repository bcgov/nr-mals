import React from "react";
import PropTypes from "prop-types";
import { Form, Row, Col } from "react-bootstrap";
import LicenceStatuses from "../lookups/LicenceStatuses";
import CustomDatePicker from "../../components/CustomDatePicker";

export default function TrailerDetailsEdit({ form, initialValues }) {
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
        <Col lg={4}>
          <LicenceStatuses
            {...register("licenceStatus", { required: true })}
            isInvalid={errors.licenceStatus}
            defaultValue={initialValues.licenceStatus}
          />
        </Col>
        <Col lg={4}>
          <Form.Group controlId="dateIssued">
            <CustomDatePicker
              id="dateIssued"
              label="Date Issued"
              notifyOnChange={handleFieldChange("dateIssued")}
              defaultValue={initialValues.dateIssued}
              isInvalid={errors.dateIssued}
            />
          </Form.Group>
        </Col>
        <Col lg={4}>
          <Form.Group controlId="trailerNumber">
            <Form.Label>Trailer #</Form.Label>
            <Form.Control
              type="text"
              name="trailerNumber"
              defaultValue={initialValues.trailerNumber}
              {...register("trailerNumber")}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={4}>
          <Form.Group controlId="geographicalDivision">
            <Form.Label>Division</Form.Label>
            <Form.Control
              type="text"
              name="geographicalDivision"
              defaultValue={initialValues.geographicalDivision}
              {...register("geographicalDivision")}
            />
          </Form.Group>
        </Col>
        <Col lg={4}>
          <Form.Group controlId="serialNumberVIN">
            <Form.Label>Serial No / VIN</Form.Label>
            <Form.Control
              type="text"
              name="serialNumberVIN"
              defaultValue={initialValues.serialNumberVIN}
              {...register("serialNumberVIN")}
            />
          </Form.Group>
        </Col>
        <Col lg={4}>
          <Form.Group controlId="licensePlate">
            <Form.Label>Licence Plate #</Form.Label>
            <Form.Control
              type="text"
              name="licensePlate"
              defaultValue={initialValues.licensePlate}
              {...register("licensePlate")}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={4}>
          <Form.Group controlId="trailerYear">
            <Form.Label>Year</Form.Label>
            <Form.Control
              type="number"
              name="trailerYear"
              defaultValue={initialValues.trailerYear}
              {...register("trailerYear")}
            />
          </Form.Group>
        </Col>
        <Col lg={4}>
          <Form.Group controlId="trailerMake">
            <Form.Label>Make</Form.Label>
            <Form.Control
              type="text"
              name="trailerMake"
              defaultValue={initialValues.trailerMake}
              {...register("trailerMake")}
            />
          </Form.Group>
        </Col>
        <Col lg={4}>
          <Form.Group controlId="trailerType">
            <Form.Label>Trailer Type</Form.Label>
            <Form.Control
              type="text"
              name="trailerType"
              defaultValue={initialValues.trailerType}
              {...register("trailerType")}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={4}>
          <Form.Group controlId="trailerCapacity">
            <Form.Label>Capacity (L)</Form.Label>
            <Form.Control
              type="number"
              name="trailerCapacity"
              defaultValue={initialValues.trailerCapacity}
              {...register("trailerCapacity")}
            />
          </Form.Group>
        </Col>
        <Col lg={4}>
          <Form.Group controlId="trailerCompartments">
            <Form.Label>Compartments</Form.Label>
            <Form.Control
              type="number"
              name="trailerCompartments"
              defaultValue={initialValues.trailerCompartments}
              {...register("trailerCompartments")}
            />
          </Form.Group>
        </Col>
        <Col lg={4}></Col>
      </Row>
    </>
  );
}

TrailerDetailsEdit.propTypes = {
  form: PropTypes.object.isRequired,
  initialValues: PropTypes.object.isRequired,
  licence: PropTypes.object,
  mode: PropTypes.string.isRequired,
};
