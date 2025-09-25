import React from "react";
import PropTypes from "prop-types";
import { Form, Col, Button } from "react-bootstrap";

const SubmissionButtons = ({
  submitButtonLabel,
  submitButtonDisabled,
  cancelButtonVisible,
  cancelButtonLabel,
  cancelButtonDisabled,
  cancelButtonOnClick,
  draftButtonVisible,
  draftButtonLabel,
  draftButtonDisabled,
  draftButtonOnClick,
  align,
  buttonSize,
}) => {
  let cancelButton;
  if (cancelButtonVisible) {
    cancelButton = (
      <Form.Group>
        <Button
          size={buttonSize}
          type="reset"
          onClick={cancelButtonOnClick}
          disabled={cancelButtonDisabled}
          variant="secondary"
          block
        >
          {cancelButtonLabel}
        </Button>
      </Form.Group>
    );
  }

  let draftButton;
  if (draftButtonVisible) {
    draftButton = (
      <Form.Group>
        <Button
          size={buttonSize}
          type="submit"
          onClick={draftButtonOnClick}
          disabled={draftButtonDisabled}
          variant="primary"
          block
        >
          {draftButtonLabel}
        </Button>
      </Form.Group>
    );
  }

  if (align === "right") {
    return (
      <Form.Row>
        <Col sm={10} />
        <Col sm={1}>{cancelButton}</Col>
        <Col sm={1}>
          <Form.Group>
            <Button
              size={buttonSize}
              type="submit"
              disabled={submitButtonDisabled}
              variant="primary"
              block
            >
              {submitButtonLabel}
            </Button>
          </Form.Group>
        </Col>
      </Form.Row>
    );
  }

  return (
    <Form.Row>
      <Col sm={4}>{cancelButton}</Col>
      <Col sm={4}>{draftButton}</Col>
      <Col sm={4}>
        <Form.Group>
          <Button
            size={buttonSize}
            type="submit"
            disabled={submitButtonDisabled}
            variant="primary"
            block
          >
            {submitButtonLabel}
          </Button>
        </Form.Group>
      </Col>
    </Form.Row>
  );
};

SubmissionButtons.propTypes = {
  submitButtonLabel: PropTypes.string,
  submitButtonDisabled: PropTypes.bool,
  cancelButtonVisible: PropTypes.bool,
  cancelButtonLabel: PropTypes.string,
  cancelButtonDisabled: PropTypes.bool,
  cancelButtonOnClick: PropTypes.func,
  draftButtonVisible: PropTypes.bool,
  draftButtonLabel: PropTypes.string,
  draftButtonDisabled: PropTypes.bool,
  draftButtonOnClick: PropTypes.func,
  align: PropTypes.string,
  buttonSize: PropTypes.string,
};

SubmissionButtons.defaultProps = {
  submitButtonLabel: "Submit",
  submitButtonDisabled: false,
  cancelButtonVisible: false,
  cancelButtonLabel: "Cancel",
  cancelButtonDisabled: false,
  cancelButtonOnClick: Function.prototype,
  draftButtonVisible: false,
  draftButtonLabel: "Save Draft",
  draftButtonDisabled: false,
  draftButtonOnClick: Function.prototype,
  align: "default",
  buttonSize: "md",
};

export default SubmissionButtons;
