import React from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";

export const SLAUGHTERHOUSE_SPECIES_MODAL = "SLAUGHTERHOUSE_SPECIES_MODAL";

export default function SlaughterhouseSpeciesModal({
  species,
  closeModal,
  submit,
}) {
  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, handleSubmit, errors } = form;

  const onSubmit = (data) => {
    const valid = true;

    if (!valid) {
      return;
    }

    submit(data);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Form.Control
        hidden
        type="number"
        id="id"
        name="id"
        defaultValue={species !== null ? species.id : null}
        ref={register}
      />
      <Modal.Header closeButton>
        <Modal.Title>
          {species
            ? "Edit Slaughterhouse Species"
            : "Add Slaughterhouse Species"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Row>
          <Col>
            <Form.Group controlId="codeName">
              <Form.Label>Species Name</Form.Label>
              <Form.Control
                type="text"
                name="codeName"
                defaultValue={species !== null ? species.codeName : null}
                ref={register({
                  required: true,
                })}
                isInvalid={errors.codeName}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid name.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.Group controlId="codeDescription">
              <Form.Label>Species Description</Form.Label>
              <Form.Control
                type="text"
                as="textarea"
                rows={6}
                maxLength={120}
                name="codeDescription"
                defaultValue={species !== null ? species.codeDescription : null}
                ref={register({
                  required: true,
                })}
                isInvalid={errors.codeDescription}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid description.
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

SlaughterhouseSpeciesModal.propTypes = {
  species: PropTypes.object,
  closeModal: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
};

SlaughterhouseSpeciesModal.defaultProps = {
  species: null,
};
