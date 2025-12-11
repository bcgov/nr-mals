import React from "react";
import PropTypes from "prop-types";
import { Col, Row } from "react-bootstrap";

const VerticalField = ({ label, value }) => {
  const emptyValue = "\u200b"; // zero-width space
  const displayedValue =
    value === null ||
    value === undefined ||
    (value.trim && value.trim().length === 0)
      ? emptyValue
      : value;

  return (
    <>
      <Row>
        <Col>
          <label className="strong">{label}</label>
        </Col>
      </Row>
      <Row>
        <Col>{displayedValue}</Col>
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
