import React from "react";
import PropTypes from "prop-types";

const PageHeading = ({ children }) => {
  return (
    <>
      <h2 className="mb-3">{children}</h2>
      <hr />
    </>
  );
};

PageHeading.propTypes = {
  children: PropTypes.any.isRequired,
};

export default PageHeading;
