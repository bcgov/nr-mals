import React from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";

export const LICENCE_TYPE = "LICENCE_TYPE";

export default function LicenceTypeModal({ licenceType, closeModal, submit }) {
  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, handleSubmit, errors } = form;

  const onSubmit = (data) => {
    const valid = true;

    if (!valid) {
      return;
    }

    const payload = {
      ...data,
    };

    submit(payload);
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
          {licenceType ? "Edit licence type" : "Add licence type"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Row>
          <Col>
            <Form.Group controlId="speciesCode">
              <Form.Label>Dairy Test Code</Form.Label>
              <Form.Control
                type="text"
                name="dairyTestCode"
                defaultValue={
                  licenceType !== null ? licenceType.speciesCode : null
                }
                ref={register({
                  required: true,
                })}
                isInvalid={errors.speciesCode}
                readOnly
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid test code.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                defaultValue={
                  licenceType !== null ? licenceType.speciesSubCode : null
                }
                ref={register({
                  required: true,
                })}
                isInvalid={errors.speciesSubCode}
                readOnly
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid description.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.Group controlId="upperLimit">
              <Form.Label>Threshold value</Form.Label>
              <Form.Control
                type="text"
                name="upperLimit"
                defaultValue={
                  licenceType !== null ? licenceType.upperLimit : null
                }
                ref={register({
                  required: true,
                })}
                isInvalid={errors.upperLimit}
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
