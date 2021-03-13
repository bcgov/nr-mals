/* eslint-disable */
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, Col } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import NumberFormat from "react-number-format";

import { formatPhoneNumber } from "../utilities/formatting";
import { parseAsInt } from "../utilities/parsing";
import CustomCheckBox from "../components/CustomCheckBox";

import { PHONE_NUMBER_TYPES } from "../utilities/constants";

export const COMMENT = "COMMENT_MODAL";

export default function CommentModal({
  licenceId,
  commentId,
  commentText,
  closeModal,
  submit,
}) {
  const onSubmit = (data) => {
    const valid = true;

    if (!valid) {
      return;
    }

    submit({
      licenceId: parseInt(data.licenceId),
      commentId: parseInt(data.commentId),
      commentText: data.commentText,
    });
  };

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, handleSubmit, setError, errors } = form;

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Form.Control
        hidden
        type="number"
        id="licenceId"
        name="licenceId"
        defaultValue={licenceId}
        ref={register}
      />
      <Form.Control
        hidden
        type="number"
        id="commentId"
        name="commentId"
        defaultValue={commentId}
        ref={register}
      />
      <Modal.Header closeButton>
        <Modal.Title>
          {commentText ? "Edit comment" : "Add a comment"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Row>
          <Col>
            <Form.Control
              as="textarea"
              rows={6}
              maxLength={2000}
              name="commentText"
              ref={register({ required: true })}
              defaultValue={commentText}
              className="mb-1"
              isInvalid={errors.commentText}
            />
            <Form.Control.Feedback type="invalid">
              Please enter a valid comment.
            </Form.Control.Feedback>
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

CommentModal.propTypes = {
  licenceId: PropTypes.number,
  commentId: PropTypes.number,
  commentText: PropTypes.string,
  closeModal: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
};

CommentModal.defaultProps = {
  licenceId: null,
  commentId: null,
  commentText: null,
};
