import React from "react";
import { Form, Col, Alert } from "react-bootstrap";

const AccessDenied = () => {
  return (
    <Form.Row>
      <Col sm={12}>
        <Alert variant="danger">
          <Alert.Heading>Access Denied</Alert.Heading>
        </Alert>
      </Col>
    </Form.Row>
  );
};

AccessDenied.propTypes = {};

export default AccessDenied;
