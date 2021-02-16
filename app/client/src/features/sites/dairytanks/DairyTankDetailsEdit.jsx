import React from "react";
import PropTypes from "prop-types";
import { Controller } from "react-hook-form";
import NumberFormat from "react-number-format";
import { Row, Col, Form } from "react-bootstrap";

import CustomDatePicker from "../../../components/CustomDatePicker";

export default function DairyTankDetailsEdit({ form, dairyTank }) {
  const { register, errors, setValue, clearErrors } = form;
  const fieldName = `dairyTanks[${dairyTank.key}]`;
  const dairyTankErrors = errors.dairyTanks
    ? errors.dairyTanks[dairyTank.key]
    : undefined;

  const handleFieldChange = (field) => {
    return (value) => {
      setValue(field, value);
    };
  };

  return (
    <>
      <fieldset name={fieldName} key={fieldName}>
        <input
          type="hidden"
          id={`${fieldName}.status`}
          name={`${fieldName}.status`}
          value={dairyTank.status || ""}
          ref={register}
        />
        <input
          type="hidden"
          id={`${fieldName}.id`}
          name={`${fieldName}.id`}
          value={dairyTank.id || ""}
          ref={register}
        />
        <input
          type="hidden"
          id={`${fieldName}.siteId`}
          name={`${fieldName}.siteId`}
          value={dairyTank.siteId || ""}
          ref={register}
        />
        <Row>
          <Col>
            <Form.Group controlId={`${fieldName}.calibrationDate`}>
              <CustomDatePicker
                id={`${fieldName}.calibrationDate`}
                label="Tank Calibration Date"
                notifyOnChange={handleFieldChange(
                  `${fieldName}.calibrationDate`
                )}
                defaultValue={dairyTank.calibrationDate}
                isInvalid={errors.calibrationDate}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId={`${fieldName}.issueDate`}>
              <CustomDatePicker
                id={`${fieldName}.issueDate`}
                label="Tank Issue Date"
                notifyOnChange={handleFieldChange(`${fieldName}.issueDate`)}
                defaultValue={dairyTank.issueDate}
                isInvalid={errors.issueDate}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId={`${fieldName}.recheckYear`}>
              <Form.Label>Recheck Year</Form.Label>
              <Form.Control
                type="number"
                name={`${fieldName}.recheckYear`}
                defaultValue={dairyTank.recheckYear}
                ref={register}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId={`${fieldName}.serialNumber`}>
              <Form.Label>Serial Number</Form.Label>
              <Form.Control
                type="number"
                name={`${fieldName}.serialNumber`}
                defaultValue={dairyTank.serialNumber}
                ref={register}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group controlId={`${fieldName}.modelNumber`}>
              <Form.Label>Model Number</Form.Label>
              <Form.Control
                type="text"
                name={`${fieldName}.modelNumber`}
                defaultValue={dairyTank.modelNumber}
                ref={register}
                isInvalid={dairyTankErrors && dairyTankErrors.names}
                onBlur={() => clearErrors(`${fieldName}.modelNumber`)}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a model number.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId={`${fieldName}.capacity`}>
              <Form.Label>Capacity</Form.Label>
              <Form.Control
                type="number"
                name={`${fieldName}.capacity`}
                defaultValue={dairyTank.capacity}
                ref={register}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId={`${fieldName}.manufacturer`}>
              <Form.Label>Manufacturer</Form.Label>
              <Form.Control
                type="text"
                name={`${fieldName}.manufacturer`}
                defaultValue={dairyTank.manufacturer}
                ref={register}
              />
            </Form.Group>
          </Col>
        </Row>
      </fieldset>
    </>
  );
}

DairyTankDetailsEdit.propTypes = {
  dairyTank: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
};
