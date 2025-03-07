import PropTypes from "prop-types";
import UserService from "../app/user-service";

export default function RenderOnRole({ roles, children }) {
  if (UserService.getToken() === undefined) {
    return null;
  }

  if (!UserService.hasRole(roles)) {
    return null;
  }

  return children;
}

RenderOnRole.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
};
