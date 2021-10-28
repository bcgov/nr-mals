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
  const { register, handleSubmit, setError, errors } = form;

  const onSubmit = (data) => {
    let valid = true;

    if (
      users.data.find(
        (x) => x.userName === data.userName && x.id !== parseAsInt(data.id)
      ) !== undefined
    ) {
      setError("userName", {
        type: "invalid",
      });
      valid = false;
    }

    if (!valid) {
      return;
    }

    const payload = {
      ...data,
      roleId: parseAsInt(data.roleId),
      active: data.active === "true",
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
        defaultValue={user !== null ? user.id : null}
        ref={register}
      />
      <Modal.Header closeButton>
        <Modal.Title>{user ? "Edit a  user" : "Add a new user"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Row>
          <Col>
            <Form.Group controlId="surname">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="surname"
                defaultValue={user !== null ? user.surname : null}
                ref={register({
                  required: true,
                })}
                isInvalid={errors.surname}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid last name.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.Group controlId="givenName1">
              <Form.Label>Given Name 1</Form.Label>
              <Form.Control
                type="text"
                name="givenName1"
                defaultValue={user !== null ? user.givenName1 : null}
                ref={register({
                  required: true,
                })}
                isInvalid={errors.givenName1}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid given name.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.Group controlId="givenName2">
              <Form.Label>Given Name 2 (Optional)</Form.Label>
              <Form.Control
                type="text"
                name="givenName2"
                defaultValue={user !== null ? user.givenName2 : null}
                ref={register}
                isInvalid={errors.givenName2}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid given name.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.Group controlId="givenName3">
              <Form.Label>Given Name 3 (Optional)</Form.Label>
              <Form.Control
                type="text"
                name="givenName3"
                defaultValue={user !== null ? user.givenName3 : null}
                ref={register}
                isInvalid={errors.givenName3}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid given name.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.Group controlId="userName">
              <Form.Label>IDIR</Form.Label>
              <Form.Control
                type="text"
                name="userName"
                defaultValue={user !== null ? user.userName : null}
                ref={register({
                  required: true,
                })}
                isInvalid={errors.userName}
              />
              <Form.Control.Feedback type="invalid">
                IDIR name is an invalid format or already in use.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.Group controlId="roleId">
              <Form.Label>Role</Form.Label>
              <Form.Control
                as="select"
                name="roleId"
                ref={register}
                defaultValue={user !== null ? user.role_id : null}
              >
                {roles.data.map((x) => {
                  return (
                    <option key={x.id} value={x.id}>
                      {x.description}
                    </option>
                  );
                })}
              </Form.Control>
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.Group controlId="active">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                name="active"
                ref={register}
                defaultValue={user !== null ? user.active : null}
              >
                <option key={1} value="true">
                  Active
                </option>
                <option key={0} value="false">
                  Inactive
                </option>
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
