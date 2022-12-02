import React from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Form.Control
        hidden
        type="number"
        id="licenceId"
        name="licenceId"
        defaultValue={licenceId}
        {...register("licenceId")}
      />
      <Form.Control
        hidden
        type="number"
        id="commentId"
        name="commentId"
        defaultValue={commentId}
        {...register("commentId")}
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
              {...register("commentText", { required: true })}
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
