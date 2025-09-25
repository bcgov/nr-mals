import React from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";

const SectionHeading = ({ children, onEdit, showEditButton }) => {
  return (
    <>
      <h3 className="mt-3 mb-3">
        {children}
        {showEditButton && onEdit && (
          <Button
            size="sm"
            variant="primary"
            className="float-right mr-3"
            onClick={onEdit}
          >
            Edit
          </Button>
        )}
      </h3>
      <hr />
    </>
  );
};

SectionHeading.propTypes = {
  children: PropTypes.any.isRequired,
  onEdit: PropTypes.func,
  showEditButton: PropTypes.bool,
};

SectionHeading.defaultProps = {
  onEdit: undefined,
  showEditButton: false,
};

export default SectionHeading;
