/* eslint-disable */
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, Col } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";

export const CONFIRMATION = "CONFIRMATION_MODAL";

export default function ConfirmationModal({
  data,
  modalTitle,
  modalContent,
  closeModal,
  submit,
  buttonLabels,
}) {
  const onSubmit = () => {
    submit(data);
  };

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, handleSubmit, setError, errors } = form;

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Modal.Header closeButton>
        <Modal.Title>{modalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Row className="container">
          <Col>{modalContent}</Col>
        </Form.Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closeModal}>
          {buttonLabels.cancel}
        </Button>
        <Button variant="primary" type="submit">
          {buttonLabels.confirm}
        </Button>
      </Modal.Footer>
    </Form>
  );
}

ConfirmationModal.propTypes = {
  data: PropTypes.any,
  modalTitle: PropTypes.string.isRequired,
  modalContent: PropTypes.any.isRequired,
  closeModal: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  buttonLabels: PropTypes.object,
};

ConfirmationModal.defaultProps = {
  data: null,
  modalTitle: "Confirmation",
  buttonLabels: { cancel: "Cancel", confirm: "OK" },
};
