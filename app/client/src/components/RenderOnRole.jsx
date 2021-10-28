import PropTypes from "prop-types";

import { useSelector } from "react-redux";
import { selectCurrentUser } from "../app/appSlice";

export default function RenderOnRole({ roles, children }) {
  const currentUser = useSelector(selectCurrentUser);

  if (currentUser.data === undefined) {
    return null;
  }

  if (!roles.some((role) => currentUser.data.roleId === role)) {
    return null;
  }

  return children;
}

RenderOnRole.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.number).isRequired,
};
