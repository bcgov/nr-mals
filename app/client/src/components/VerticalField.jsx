import React from "react";
import PropTypes from "prop-types";
import { Col, Row } from "react-bootstrap";

const VerticalField = ({ label, value }) => {
  return (
    <>
      <Row>
        <Col>
          <label className="strong">{label}</label>
        </Col>
      </Row>
      <Row>
        <Col>{value}</Col>
      </Row>
    </>
  );
};

VerticalField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.node,
};
VerticalField.defaultProps = {
  label: null,
  value: null,
};

export default VerticalField;
