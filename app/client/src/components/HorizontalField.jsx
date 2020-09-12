import React from "react";
import PropTypes from "prop-types";
import { Col } from "react-bootstrap";

const HorizontalField = ({ label, value }) => {
  return (
    <>
      <Col>
        <label className="strong">{label}</label>
      </Col>
      <Col>{value}</Col>
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
