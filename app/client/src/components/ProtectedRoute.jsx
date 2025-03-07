import React from "react";
import { Redirect, Route } from "react-router-dom";
import PropTypes from "prop-types";
import UserService from "../app/user-service";

export default function ProtectedRoute({
  children,
  path,
  validRoles = undefined,
}) {
  const valid =
    UserService.getToken() &&
    (!validRoles || validRoles.some((role) => UserService.hasRole([role])));

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
  validRoles: PropTypes.array,
};
