/* eslint-disable */
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, Col } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { PatternFormat } from "react-number-format";

import { parseAsInt } from "../utilities/parsing";

import { PHONE_NUMBER_TYPES } from "../utilities/constants";

export const PHONE = "PHONE_MODAL";

export default function PhoneNumberModal({
  phone,
  existingTypes,
  closeModal,
  submit,
}) {
  const onSubmit = (data) => {
    let valid = true;

    // validate phone number
    if (
      data.number === undefined ||
      !data.number.match(/^$|\(\d{3}\) \d{3}-\d{4}/g)
    ) {
      setError("number", { type: "invalid" });
      valid = false;
    }

    if (!valid) {
      return;
    }

    submit({
      key: parseAsInt(data.phoneKey),
      id: data.id === undefined ? -1 : data.id,
      number: data.number,
      phoneNumberType: data.phoneNumberType,
    });
  };

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;

  const phoneTypes = [
    { value: PHONE_NUMBER_TYPES.PRIMARY, description: "Primary Phone" },
    { value: PHONE_NUMBER_TYPES.SECONDARY, description: "Secondary Phone" },
    { value: PHONE_NUMBER_TYPES.FAX, description: "Fax" },
  ];

  const phoneOptions = phoneTypes.filter(
    (x) => !existingTypes.includes(x.value) || x.value === phone.phoneNumberType
  );

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Form.Control
        hidden
        type="number"
        id="phoneKey"
        name="phoneKey"
        defaultValue={phone.key}
        {...register("phoneKey")}
      />
      <Modal.Header closeButton>
        <Modal.Title>
          {phone.number ? "Edit a Phone Number" : "Add a Phone Number"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Row>
          <Col lg={6}>
            <Form.Group controlId="phoneNumberType">
              <Form.Label>Phone Type</Form.Label>
              <Form.Control
                as="select"
                name="phoneNumberType"
                {...register("phoneNumberType")}
                defaultValue={
                  phone.phoneNumberType ?? PHONE_NUMBER_TYPES.PRIMARY
                }
                custom
              >
                {phoneOptions.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.description}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col lg={6}>
            <Form.Group controlId="number">
              <Form.Label>Number</Form.Label>
              <Controller
                render={({ field: { onChange }, formState }) => (
                  <>
                    <PatternFormat
                      customInput={Form.Control}
                      format="(###) ###-####"
                      mask="_"
                      defaultValue={phone.number ?? null}
                      onValueChange={(v) => {
                        onChange(v.formattedValue);
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      Please enter a valid phone number.
                    </Form.Control.Feedback>
                  </>
                )}
                name="number"
                control={form.control}
                isInvalid={errors.number}
                defaultValue={phone.number ?? null}
              />
            </Form.Group>
          </Col>
        </Form.Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Modal.Footer>
    </Form>
  );
}

PhoneNumberModal.propTypes = {
  phone: PropTypes.object.isRequired,
  existingTypes: PropTypes.array,
  closeModal: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
};

PhoneNumberModal.defaultProps = {
  existingTypes: [],
};
