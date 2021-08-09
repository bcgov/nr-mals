import React from "react";
import PropTypes from "prop-types";
import { Form, Col, Alert } from "react-bootstrap";

const ErrorMessageRow = ({ variant, errorMessage, errorHeading }) => {
  if (!errorMessage) {
    return null;
  }

  return (
    <Form.Row className="mt-3">
      <Col sm={12}>
        <Alert variant={variant}>
          {errorHeading ? <Alert.Heading>{errorHeading}</Alert.Heading> : null}
          <div>{errorMessage}</div>
        </Alert>
      </Col>
    </Form.Row>
  );
};

ErrorMessageRow.propTypes = {
  variant: PropTypes.string,
  errorMessage: PropTypes.string,
  errorHeading: PropTypes.string,
};

ErrorMessageRow.defaultProps = {
  variant: "danger",
  errorMessage: null,
  errorHeading: "An error was encountered while submitting the form.",
};

export default ErrorMessageRow;
