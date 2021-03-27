/* eslint-disable */
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Container, Form, Col, InputGroup, Button } from "react-bootstrap";

import PageHeading from "../../components/PageHeading";

import AdminManageUsers from "./AdminManageUsers";

import { ADMIN_CONFIG_OPTIONS } from "../../utilities/constants";

export default function AdminConfig() {
  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, watch } = form;

  const selectedConfig = watch("selectedConfig", null);

  let control = null;
  switch (selectedConfig) {
    case ADMIN_CONFIG_OPTIONS.MANAGE_USERS:
      control = <AdminManageUsers />;
      break;
    default:
      break;
  }

  return (
    <>
      <PageHeading>Configuration</PageHeading>
      <Container className="mt-3 mb-4">
        <Form.Label>Select an option:</Form.Label>
        <Form.Control
          as="select"
          name="selectedConfig"
          ref={register}
          defaultValue={null}
          style={{ width: 300 }}
        >
          <option value={null}></option>
          <option value={ADMIN_CONFIG_OPTIONS.MANAGE_USERS}>
            Manage Users
          </option>
        </Form.Control>

        <div className="mt-5">{control}</div>
      </Container>
    </>
  );
}

AdminConfig.propTypes = {};
