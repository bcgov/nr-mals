import React from "react";
import { NavDropdown } from "react-bootstrap";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import classNames from "classnames";

function HeaderDropdown({ id, title, location, pathPrefix, children }) {
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

HeaderDropdown.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  location: PropTypes.object.isRequired,
  pathPrefix: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  children: PropTypes.node.isRequired,
};
HeaderDropdown.defaultProps = {
  pathPrefix: [],
};

export default withRouter(HeaderDropdown);
