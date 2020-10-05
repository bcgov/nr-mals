import React from "react";
import PropTypes from "prop-types";

const SectionHeading = ({ children }) => {
  return (
    <>
      <h3 className="mt-3 mb-3">{children}</h3>
      <hr />
    </>
  );
};

SectionHeading.propTypes = {
  children: PropTypes.any.isRequired,
};

export default SectionHeading;
