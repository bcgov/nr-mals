import React from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Button, Modal, Form, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { parseAsInt } from "../utilities/parsing";

import { selectUsers, selectRoles } from "../features/admin/adminSlice";

export const USER = "USER_MODAL";

export default function UserModal({ user, closeModal, submit }) {
  const users = useSelector(selectUsers);
  const roles = useSelector(selectRoles);

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;

  const onSubmit = (data) => {
    let valid = true;

    if (
      users.data.find(
        (x) =>
          x.idirUsername === data.idirUsername && x.id !== parseAsInt(data.id)
      ) !== undefined
    ) {
      setError("idirUsername", {
        type: "invalid",
      });
      valid = false;
    }

    if (!valid) {
      return;
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: data.role,
      previousRole: user.role,
    };

    submit(payload);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Form.Control
        hidden
        type="text"
        id="id"
        name="id"
        value={user !== null ? user.id : null}
        readOnly
      />
      <Form.Control
        hidden
        type="text"
        id="username"
        name="username"
        value={user !== null ? user.username : null}
        readOnly
      />
      <Modal.Header closeButton>
        <Modal.Title>{user ? "Edit a  user" : "Add a new user"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Row>
          <Col>
            <Form.Group controlId="lastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={user !== null ? user.lastName : null}
                readOnly
              />
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.Group controlId="firstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={user !== null ? user.firstName : null}
                readOnly
              />
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.Group controlId="idirUsername">
              <Form.Label>IDIR</Form.Label>
              <Form.Control
                type="text"
                name="idirUsername"
                defaultValue={user !== null ? user.idirUsername : null}
                readOnly
              />
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.Group controlId="role">
              <Form.Label>Role</Form.Label>
              <Form.Control
                as="select"
                name="role"
                {...register("role")}
                defaultValue={user !== null ? user.role : null}
              >
                {roles.data.map((x) => {
                  return (
                    <option key={x.id} value={x.description}>
                      {x.description}
                    </option>
                  );
                })}
              </Form.Control>
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

UserModal.propTypes = {
  user: PropTypes.object,
  closeModal: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
};

UserModal.defaultProps = {
  user: null,
};
