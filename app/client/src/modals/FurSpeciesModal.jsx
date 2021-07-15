import React from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Button, Modal, Form, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { parseAsInt } from "../utilities/parsing";

export const FUR_SPECIES_MODAL = "FUR_SPECIES_MODAL";

export default function FurSpeciesModal({ species, closeModal, submit }) {
  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, handleSubmit, setError, errors } = form;

  const onSubmit = (data) => {
    let valid = true;

    if (!valid) {
      return;
    }

    submit(payload);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Form.Control
        hidden
        type="number"
        id="id"
        name="id"
        defaultValue={user !== null ? user.id : null}
        ref={register}
      />
      <Modal.Header closeButton>
        <Modal.Title>
          {user ? "Edit Fur Species" : "Add Fur Species"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Row>
          <Col>
            <Form.Group controlId="speciesName">
              <Form.Label>Species Name</Form.Label>
              <Form.Control
                type="text"
                name="speciesName"
                defaultValue={user !== null ? user.speciesName : null}
                ref={register({
                  required: true,
                })}
                isInvalid={errors.speciesName}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid name.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.Group controlId="speciesDescription">
              <Form.Label>Species Description</Form.Label>
              <Form.Control
                type="text"
                as="textarea"
                rows={6}
                maxLength={2000}
                name="speciesDescription"
                defaultValue={user !== null ? user.speciesDescription : null}
                ref={register({
                  required: true,
                })}
                isInvalid={errors.speciesDescription}
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

FurSpeciesModal.propTypes = {
  species: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
};
