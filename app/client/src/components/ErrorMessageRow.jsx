import React from "react";
import PropTypes from "prop-types";
import { Form, Col, Alert } from "react-bootstrap";

const ErrorMessageRow = ({ errorMessage, errorHeading }) => {
  if (!errorMessage) {
    return null;
  }

  return (
    <Form.Row>
      <Col sm={12}>
        <Alert variant="danger">
          <Alert.Heading>{errorHeading}</Alert.Heading>
          <p>{errorMessage}</p>
        </Alert>
      </Col>
    </Form.Row>
  );
};

ErrorMessageRow.propTypes = {
  errorMessage: PropTypes.string,
  errorHeading: PropTypes.string,
};

ErrorMessageRow.defaultProps = {
  errorMessage: null,
  errorHeading: "An error was encountered while submitting the form.",
};

export default ErrorMessageRow;
