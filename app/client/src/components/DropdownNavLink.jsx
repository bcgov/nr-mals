import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";

const propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default class DropdownNavLink extends Component {
  render() {
    const { to, children } = this.props;

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
}

DropdownNavLink.propTypes = propTypes;
