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
}) => {
  let cancelButton;
  if (cancelButtonVisible) {
    cancelButton = (
      <Form.Group>
        <Button
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

  return (
    <Form.Row>
      <Col sm={4}>{cancelButton}</Col>
      <Col sm={4} />
      <Col sm={4}>
        <Form.Group>
          <Button
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
};

SubmissionButtons.defaultProps = {
  submitButtonLabel: "Submit",
  submitButtonDisabled: false,
  cancelButtonVisible: false,
  cancelButtonLabel: "Cancel",
  cancelButtonDisabled: false,
  cancelButtonOnClick: Function.prototype,
};

export default SubmissionButtons;
