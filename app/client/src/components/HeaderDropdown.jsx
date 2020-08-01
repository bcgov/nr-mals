import React, { Component } from "react";
import { NavDropdown } from "react-bootstrap";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import classNames from "classnames";

const propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  pathPrefix: PropTypes.string || PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node.isRequired,
};

const defaultProps = {
  pathPrefix: [],
};

class HeaderDropdown extends Component {
  render() {
    const { id, title, location, pathPrefix, children } = this.props;
    const pathPrefixArray = [].concat(pathPrefix || []);

    return (
      <NavDropdown
        id={id}
        title={title}
        className={classNames({
          active: pathPrefixArray.some((p) => location.pathname.startsWith(p)),
        })}
      >
        {children}
      </NavDropdown>
    );
  }
}

HeaderDropdown.propTypes = propTypes;
HeaderDropdown.defaultProps = defaultProps;

export default withRouter(HeaderDropdown);
