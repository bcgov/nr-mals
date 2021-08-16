import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Container, Form, Col, Button } from "react-bootstrap";

import { REQUEST_STATUS, SYSTEM_ROLES } from "../../utilities/constants";
import { formatDateString } from "../../utilities/formatting.ts";

import { openModal } from "../../app/appSlice";
import { COMMENT } from "../../modals/CommentModal";

import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
  selectComments,
} from "./commentsSlice";

import RenderOnRole from "../../components/RenderOnRole";
import SectionHeading from "../../components/SectionHeading";
import ErrorMessageRow from "../../components/ErrorMessageRow";
import SubmissionButtons from "../../components/SubmissionButtons";

import "./Comments.scss";

export default function Comments({ licence }) {
  const comments = useSelector(selectComments);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchComments(licence.id));
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, handleSubmit, setValue, errors, watch } = form;

  const { status, error } = comments;
  const submitting = status === REQUEST_STATUS.PENDING;

  const commentTextWatch = watch("commentText");
  const hasComment = commentTextWatch && commentTextWatch.length > 0;

  let errorMessage = null;
  if (status === REQUEST_STATUS.REJECTED) {
    errorMessage = `${error.code}: ${error.description}`;
  }

  const submissionLabel = submitting ? "Saving..." : "Save";

  const onSubmit = async (data) => {
    const payload = {
      licenceId: licence.id,
      licenceComment: data.commentText,
    };

    setValue("commentText", null);
    dispatch(createComment(payload));
  };

  const onCancel = () => {};

  const editCommentCallback = (data) => {
    const payload = {
      licenceId: data.licenceId,
      commentId: data.commentId,
      licenceComment: data.commentText,
    };

    dispatch(updateComment({ comment: payload, id: data.commentId }));
  };

  const editComment = (licenceId, commentId, commentText) => {
    dispatch(
      openModal(
        COMMENT,
        editCommentCallback,
        { licenceId, commentId, commentText },
        "lg"
      )
    );
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <SectionHeading>Comments</SectionHeading>
      <Container className="mt-3 mb-4">
        <RenderOnRole roles={[SYSTEM_ROLES.USER, SYSTEM_ROLES.SYSTEM_ADMIN]}>
          <Form.Control
            as="textarea"
            rows={6}
            maxLength={2000}
            name="commentText"
            ref={register({ required: true })}
            className="mb-1"
            isInvalid={errors.commentText}
          />
          <Form.Control.Feedback type="invalid">
            Please enter a valid comment.
          </Form.Control.Feedback>
          <SubmissionButtons
            submitButtonLabel={submissionLabel}
            submitButtonDisabled={submitting || !hasComment}
            cancelButtonVisible
            cancelButtonOnClick={onCancel}
            align="right"
            buttonSize="sm"
          />
          <ErrorMessageRow errorMessage={errorMessage} />{" "}
        </RenderOnRole>

        {comments.data !== undefined
          ? comments.data.map((comment) => {
              return (
                <Form.Row key={comment.id} className="mb-5">
                  <Col>
                    <Form.Row className="comment-row">
                      <Col lg={8} className="comment-user-name">
                        {comment.create_userid}
                      </Col>
                      <RenderOnRole
                        roles={[SYSTEM_ROLES.USER, SYSTEM_ROLES.SYSTEM_ADMIN]}
                      >
                        <Col lg={1}>
                          <Button
                            type="button"
                            onClick={() =>
                              editComment(
                                licence.id,
                                comment.id,
                                comment.licence_comment
                              )
                            }
                            variant="text"
                            block
                            className="comment-delete-btn"
                          >
                            Edit
                          </Button>
                        </Col>
                        <Col lg={1}>
                          <Button
                            type="button"
                            onClick={() =>
                              dispatch(
                                deleteComment({
                                  licenceId: licence.id,
                                  id: comment.id,
                                })
                              )
                            }
                            variant="text"
                            block
                            className="comment-delete-btn"
                          >
                            Delete
                          </Button>
                        </Col>
                      </RenderOnRole>
                      <RenderOnRole
                        roles={[SYSTEM_ROLES.READ_ONLY, SYSTEM_ROLES.INSPECTOR]}
                      >
                        <Col lg={2} />
                      </RenderOnRole>
                      <Col lg={2} className="comment-date">
                        {formatDateString(comment.create_timestamp)}
                      </Col>
                    </Form.Row>
                    <Form.Row>
                      <Col>{comment.licence_comment}</Col>
                    </Form.Row>
                  </Col>
                </Form.Row>
              );
            })
          : null}
      </Container>
    </Form>
  );
}

Comments.propTypes = {
  licence: PropTypes.object.isRequired,
};
