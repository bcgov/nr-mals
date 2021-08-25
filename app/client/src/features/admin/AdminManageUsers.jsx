/* eslint-disable no-use-before-define */
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spinner, Table, Row, Col, Button } from "react-bootstrap";

import SectionHeading from "../../components/SectionHeading";
import ErrorMessageRow from "../../components/ErrorMessageRow";

import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  fetchRoles,
  selectUsers,
  selectRoles,
} from "./adminSlice";

import { REQUEST_STATUS } from "../../utilities/constants";

import { openModal } from "../../app/appSlice";
import { CONFIRMATION } from "../../modals/ConfirmationModal";
import { USER } from "../../modals/UserModal";

import { displayPersonName } from "../../utilities/formatting.ts";

export default function AdminManageUsers() {
  const users = useSelector(selectUsers);
  const roles = useSelector(selectRoles);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRoles());
  }, [dispatch]);

  const addUserCallback = (data) => {
    dispatch(createUser({ user: data }));
  };

  const editUserCallback = (data) => {
    dispatch(updateUser({ user: data }));
  };

  const onDeleteUserCallback = (data) => {
    dispatch(deleteUser({ user: data }));
  };

  function formatResultRow(result, showOptions = true) {
    return (
      <tr key={result.id}>
        <td className="text-nowrap">{displayPersonName(result, true)}</td>
        <td className="text-nowrap">{result.userName}</td>
        <td className="text-nowrap">
          {roles.data.find((x) => x.id === result.roleId).description}
        </td>
        <td className="text-nowrap">
          {result.active === true ? "Active" : "Inactive"}
        </td>
        {showOptions ? (
          <>
            <td className="text-nowrap">
              <Button variant="link" onClick={async () => onEditUser(result)}>
                Edit
              </Button>
            </td>
            <td className="text-nowrap">
              <Button variant="link" onClick={async () => onDeleteUser(result)}>
                Delete
              </Button>
            </td>
          </>
        ) : null}
      </tr>
    );
  }

  function onAddUser() {
    dispatch(openModal(USER, addUserCallback, { roles: roles.data }, "md"));
  }

  function onEditUser(result) {
    dispatch(
      openModal(
        USER,
        editUserCallback,
        { user: result, roles: roles.data },
        "md"
      )
    );
  }

  const onDeleteUser = (result) => {
    const data = { ...result };
    dispatch(
      openModal(
        CONFIRMATION,
        onDeleteUserCallback,
        {
          data,
          modalContent: (
            <>
              <Row>
                <div className="justify-content-center">
                  You are about to delete the following user:
                </div>
              </Row>
              <Row>
                <Table striped size="sm" responsive className="mt-3" hover>
                  <thead className="thead-dark">
                    <tr>
                      <th className="text-nowrap">Name</th>
                      <th className="text-nowrap">Username (IDIR ID)</th>
                      <th className="text-nowrap">Role</th>
                      <th className="text-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody>{formatResultRow(result, false)}</tbody>
                </Table>
              </Row>
              <br />
              <Row>
                <div className="justify-content-center">
                  Do you wish to proceed?
                </div>
              </Row>
            </>
          ),
        },
        "md"
      )
    );
  };

  const createUserButton = (
    <Button size="md" type="button" variant="primary" onClick={onAddUser} block>
      Add a new user
    </Button>
  );

  let usersErrorMessage = null;
  if (users.status === REQUEST_STATUS.REJECTED) {
    usersErrorMessage = `${users.error.code}: ${users.error.description}`;
  }

  let rolesErrorMessage = null;
  if (roles.status === REQUEST_STATUS.REJECTED) {
    rolesErrorMessage = `${roles.error.code}: ${roles.error.description}`;
  }

  return (
    <>
      <SectionHeading>Manage Users</SectionHeading>

      <Table striped size="sm" responsive className="mt-3" hover>
        <thead className="thead-dark">
          <tr>
            <th className="text-nowrap">Name</th>
            <th className="text-nowrap">Username (IDIR ID)</th>
            <th className="text-nowrap">Role</th>
            <th className="text-nowrap">Status</th>
            <th className="text-nowrap" />
            <th className="text-nowrap" />
          </tr>
        </thead>
        {users.status === REQUEST_STATUS.FULFILLED &&
        roles.status === REQUEST_STATUS.FULFILLED ? (
          <tbody>{users.data.map((user) => formatResultRow(user))}</tbody>
        ) : null}
      </Table>
      {users.status === REQUEST_STATUS.PENDING ? (
        <Spinner animation="border" role="status">
          <span className="sr-only">Searching...</span>
        </Spinner>
      ) : null}
      <Row className="mt-3">
        <Col>
          <span className="float-right">{createUserButton}</span>
        </Col>
      </Row>
      <ErrorMessageRow errorMessage={usersErrorMessage} />
      <ErrorMessageRow errorMessage={rolesErrorMessage} />
    </>
  );
}

AdminManageUsers.propTypes = {};
