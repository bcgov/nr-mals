import React from "react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";

function DropdownNavLink({ to, children }) {
  return (
    <NavLink
      className="dropdown-item"
      to={to}
      onClick={() => document.body.click()}
    >
      {children}
    </NavLink>
  );
}

DropdownNavLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default DropdownNavLink;
