import React from "react";
import PropTypes from "prop-types";
import { Form, Col, InputGroup } from "react-bootstrap";
import { PatternFormat } from "react-number-format";
import { Controller } from "react-hook-form";

import { formatPhoneNumber } from "../../utilities/formatting.ts";

import CustomDatePicker from "../../components/CustomDatePicker";

export default function BondInformationEdit({ form, initialValues }) {
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
      <Form.Row>
        <Col lg={4}>
          <Form.Group controlId="bondNumber">
            <Form.Label>Bond Number</Form.Label>
            <Form.Control
              type="text"
              name="bondNumber"
              defaultValue={initialValues.bondNumber}
              {...register("bondNumber")}
            />
          </Form.Group>
        </Col>
        <Col lg={2} />
        <Col lg={4}>
          <Form.Group controlId="bondValue">
            <Form.Label>Value</Form.Label>
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>$</InputGroup.Text>
              </InputGroup.Prepend>
              <Form.Control
                type="text"
                name="bondValue"
                {...register("bondValue", {
                  required: true,
                  pattern: /^(\d|[1-9]\d+)(\.\d{2})?$/i,
                })}
                isInvalid={errors.bondValue}
                defaultValue={initialValues.bondValue}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid monetary amount.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        </Col>
      </Form.Row>
      <Form.Row>
        <Col lg={6}>
          <Form.Group controlId="bondCarrierName">
            <Form.Label>Carrier Name</Form.Label>
            <Form.Control
              type="text"
              name="bondCarrierName"
              defaultValue={initialValues.bondCarrierName}
              {...register("bondCarrierName")}
            />
          </Form.Group>
        </Col>
        <Col lg={4}>
          <Form.Group controlId="bondCarrierPhoneNumber">
            <Form.Label>Carrier Phone Number</Form.Label>
            <Controller
              render={({ field: { onChange } }) => (
                <>
                  <PatternFormat
                    customInput={Form.Control}
                    format="(###) ###-####"
                    mask="_"
                    defaultValue={formatPhoneNumber(
                      initialValues.bondCarrierPhoneNumber
                    )}
                    onValueChange={(v) => {
                      onChange(v.formattedValue);
                    }}
                    isInvalid={errors && errors.bondCarrierPhoneNumber}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid phone number.
                  </Form.Control.Feedback>
                </>
              )}
              name="bondCarrierPhoneNumber"
              control={form.control}
              defaultValue={formatPhoneNumber(
                initialValues.bondCarrierPhoneNumber
              )}
            />
          </Form.Group>
        </Col>
      </Form.Row>
      <Form.Row>
        <Col lg={4}>
          <CustomDatePicker
            id="bondContinuationExpiryDate"
            label="Continuation Expiry Date"
            notifyOnChange={handleFieldChange("bondContinuationExpiryDate")}
            defaultValue={initialValues.bondContinuationExpiryDate}
          />
        </Col>
        <Col lg={8} />
      </Form.Row>
    </>
  );
}

BondInformationEdit.propTypes = {
  form: PropTypes.object.isRequired,
  initialValues: PropTypes.object.isRequired,
};
