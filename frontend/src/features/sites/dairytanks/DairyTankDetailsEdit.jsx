import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { Row, Col, Form } from "react-bootstrap";

import CustomDatePicker from "../../../components/CustomDatePicker";
import { parseAsDate } from "../../../utilities/parsing";

import {
  DAIRY_TANK_STATUS,
} from "../../../utilities/constants";

export default function DairyTankDetailsEdit({ form, dairyTank }) {
  const dispatch = useDispatch();
  const {
    register,
    formState: { errors },
    setValue,
    clearErrors,
  } = form;
  const fieldName = `dairyTanks.${dairyTank.key}`;
  const fieldName2 = `dairyTankDates.${dairyTank.key}`;
  const dairyTankErrors = errors.dairyTanks
    ? errors.dairyTanks[dairyTank.key]
    : undefined;

  useEffect(() => {
    setValue(
      `${fieldName2}.calibrationDate`,
      parseAsDate(dairyTank.calibrationDate)
    );
    setValue(`${fieldName2}.issueDate`, parseAsDate(dairyTank.issueDate));
  }, [dispatch]);

  const handleFieldChange = (field) => {
    return (value) => {
      setValue(field, value);
    };
  };

  // There's some issue with the new react-hook-form and updating these inputs automatically
  setValue(`${fieldName}.status`, dairyTank.status);
  setValue(`${fieldName}.id`, dairyTank.id);
  setValue(`${fieldName}.siteId`, dairyTank.siteId);
  if (dairyTankErrors) {
    console.log(dairyTank.status);
    console.log(dairyTankErrors);
  }
  return (
    <>
      <fieldset name={fieldName} key={fieldName}>
        <input
          type="hidden"
          id={`${fieldName}.status`}
          name={`${fieldName}.status`}
          value={dairyTank.status || ""}
          {...register(`${fieldName}.status`)}
        />
        <input
          type="hidden"
          id={`${fieldName}.id`}
          name={`${fieldName}.id`}
          value={dairyTank.id || ""}
          {...register(`${fieldName}.id`)}
        />
        <input
          type="hidden"
          id={`${fieldName}.siteId`}
          name={`${fieldName}.siteId`}
          value={dairyTank.siteId || ""}
          {...register(`${fieldName}.siteId`)}
        />
        <Row>
          <Col>
            <Form.Group controlId={`${fieldName2}.calibrationDate`}>
              <CustomDatePicker
                id={`${fieldName2}.calibrationDate`}
                label="Tank Calibration Date"
                notifyOnChange={handleFieldChange(
                  `${fieldName2}.calibrationDate`
                )}
                defaultValue={parseAsDate(dairyTank.calibrationDate)}
                isInvalid={errors.calibrationDate}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId={`${fieldName2}.issueDate`}>
              <CustomDatePicker
                id={`${fieldName2}.issueDate`}
                label="Tank Issue Date"
                notifyOnChange={handleFieldChange(`${fieldName2}.issueDate`)}
                defaultValue={parseAsDate(dairyTank.issueDate)}
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
                {...register(`${fieldName}.recheckYear`)}
                maxLength={4}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId={`${fieldName}.serialNumber`}>
              <Form.Label>Serial Number</Form.Label>
              <Form.Control
                type="text"
                name={`${fieldName}.serialNumber`}
                defaultValue={dairyTank.serialNumber}
                {...register(`${fieldName}.serialNumber`)}
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
                {...register(`${fieldName}.modelNumber`, {
                  required: dairyTank.status === DAIRY_TANK_STATUS.NEW || dairyTank.status === DAIRY_TANK_STATUS.EXISTING
                })}
                isInvalid={dairyTankErrors && dairyTankErrors.modelNumber}
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
                type="text"
                name={`${fieldName}.capacity`}
                defaultValue={dairyTank.capacity}
                {...register(`${fieldName}.capacity`)}
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
                {...register(`${fieldName}.manufacturer`)}
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
