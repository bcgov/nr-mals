import React from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";

import CustomDatePicker from "../components/CustomDatePicker";
import {
  parseAsDate,
  parseAsInt,
  parseAsFloat,
  isNullOrEmpty,
} from "../utilities/parsing";

export const LICENCE_TYPE = "LICENCE_TYPE";

export default function LicenceTypeModal({ licenceType, closeModal, submit }) {
  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, setValue, handleSubmit, errors } = form;
  setValue("standardIssueDate", licenceType.standardIssueDate);
  setValue("standardExpiryDate", licenceType.standardExpiryDate);

  const onSubmit = (data) => {
    const valid = true;

    if (!valid) {
      return;
    }

    const payload = {
      id: data.id,
      licenceType: data.licenceType,
      standardFee: parseAsFloat(data.standardFee),
      licenceTerm: parseAsInt(data.licenceTerm),
      standardIssueDate: isNullOrEmpty(data.standardIssueDate)
        ? null
        : new Date(data.standardIssueDate),
      standardExpiryDate: isNullOrEmpty(data.standardExpiryDate)
        ? null
        : new Date(data.standardExpiryDate),
      renewalNotice: parseAsInt(data.renewalNotice),
      legislation: data.applicableAct,
      regulation: data.regulation,
    };

    submit(payload);
  };

  const handleFieldChange = (field) => {
    return (value) => {
      setValue(field, value);
    };
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Form.Control
        hidden
        type="number"
        id="id"
        name="id"
        defaultValue={licenceType !== null ? licenceType.id : null}
        ref={register}
      />
      <Modal.Header closeButton>
        <Modal.Title>
          {licenceType ? "Edit a Licence Type" : "Add a Licence Type"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Row>
          <Col>
            <Form.Group controlId="licenceType">
              <Form.Label>Licence Type Name</Form.Label>
              <Form.Control
                type="text"
                name="licenceType"
                defaultValue={
                  licenceType !== null ? licenceType.licenceType : null
                }
                ref={register({
                  required: true,
                })}
                isInvalid={errors.licenceType}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid name.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.Group controlId="standardFee">
              <Form.Label>Standard Fee</Form.Label>
              <Form.Control
                type="text"
                name="standardFee"
                defaultValue={
                  licenceType !== null ? licenceType.standardFee : null
                }
                ref={register({
                  required: true,
                })}
                isInvalid={errors.standardFee}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid value.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.Group controlId="renewalNotice">
              <Form.Label>Renewal Notice Term</Form.Label>
              <Form.Control
                type="text"
                name="renewalNotice"
                defaultValue={
                  licenceType !== null ? licenceType.renewalNotice : null
                }
                ref={register({
                  required: true,
                })}
                isInvalid={errors.renewalNotice}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid value.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.Group controlId="licenceTerm">
              <Form.Label>Licence Term (Years)</Form.Label>
              <Form.Control
                type="text"
                name="licenceTerm"
                defaultValue={
                  licenceType !== null ? licenceType.licenceTerm : null
                }
                ref={register({
                  required: true,
                })}
                isInvalid={errors.licenceTerm}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid value.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <CustomDatePicker
              id="standardIssueDate"
              label="Standard Issue Date"
              notifyOnChange={handleFieldChange("standardIssueDate")}
              defaultValue={parseAsDate(licenceType.standardIssueDate)}
            />
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <CustomDatePicker
              id="standardExpiryDate"
              label="Standard Expiry Date"
              notifyOnChange={handleFieldChange("standardExpiryDate")}
              defaultValue={parseAsDate(licenceType.standardExpiryDate)}
            />
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.Group controlId="applicableAct">
              <Form.Label>Applicable Act</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                name="applicableAct"
                defaultValue={
                  licenceType !== null ? licenceType.legislation : null
                }
                ref={register({
                  required: false,
                })}
                maxLength={2000}
                isInvalid={errors.applicableAct}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid value.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.Group controlId="regulation">
              <Form.Label>Regulation</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                name="regulation"
                defaultValue={
                  licenceType !== null ? licenceType.regulation : null
                }
                ref={register({
                  required: false,
                })}
                maxLength={2000}
                isInvalid={errors.regulation}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid value.
              </Form.Control.Feedback>
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

LicenceTypeModal.propTypes = {
  licenceType: PropTypes.object,
  closeModal: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
};

LicenceTypeModal.defaultProps = {
  licenceType: null,
};
