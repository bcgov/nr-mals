import React from "react";
import { useSelector } from "react-redux";
import { Redirect, Route } from "react-router-dom";
import PropTypes from "prop-types";

import { selectCurrentUser } from "../app/appSlice";

export default function ProtectedRoute({ children, path, validRoles }) {
  const currentUser = useSelector(selectCurrentUser);
  const valid = validRoles.some((role) => currentUser.data.roleId === role);

  return (
    <Route
      path={path}
      render={() =>
        valid ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/",
            }}
          />
        )
      }
    />
  );
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  path: PropTypes.string.isRequired,
  validRoles: PropTypes.any.isRequired,
};
