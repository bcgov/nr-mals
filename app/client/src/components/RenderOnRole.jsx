import { useEffect } from "react";
import PropTypes from "prop-types";
import keycloak from "../app/keycloak";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUser, selectCurrentUser } from "../app/appSlice";

export default function RenderOnRole({ roles, children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      fetchCurrentUser({
        data: { idir: keycloak.getKeycloak().tokenParsed.idir_username },
      })
    );
  }, [dispatch]);

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
