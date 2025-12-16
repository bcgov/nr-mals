import React from "react";
import PropTypes from "prop-types";
import { Col } from "react-bootstrap";

const HorizontalField = ({ label, value }) => {
  const emptyValue = "\u200b"; // zero-width space
  const displayedValue =
    value === null ||
    value === undefined ||
    (value.trim && value.trim().length === 0)
      ? emptyValue
      : value;

  return (
    <>
      <Col>
        <label className="strong">{label}</label>
      </Col>
      <Col>{displayedValue}</Col>
    </>
  );
};

HorizontalField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.node,
};
HorizontalField.defaultProps = {
  label: null,
  value: null,
};

export default HorizontalField;
