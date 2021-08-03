import React from "react";
import { useForm } from "react-hook-form";
import { Container, Form } from "react-bootstrap";

import PageHeading from "../../components/PageHeading";

import { ADMIN_CONFIG_OPTIONS } from "../../utilities/constants";

import AdminManageUsers from "./AdminManageUsers";
import AdminManageDairyTestValues from "./AdminManageDairyTestValues";
import AdminManageLicenceTypes from "./AdminManageLicenceTypes";
import AdminManageFurSpecies from "./AdminManageFurSpecies";
import AdminManageGameSpecies from "./AdminManageGameSpecies";
import AdminManageSlaughterhouseSpecies from "./AdminManageSlaughterhouseSpecies";

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
    case ADMIN_CONFIG_OPTIONS.MANAGE_DAIRY_THRESHOLDS:
      control = <AdminManageDairyTestValues />;
      break;
    case ADMIN_CONFIG_OPTIONS.MANAGE_LICENCE_TYPES:
      control = <AdminManageLicenceTypes />;
      break;
    case ADMIN_CONFIG_OPTIONS.MANAGE_FUR_SPECIES:
      control = <AdminManageFurSpecies />;
      break;
    case ADMIN_CONFIG_OPTIONS.MANAGE_GAME_SPECIES:
      control = <AdminManageGameSpecies />;
      break;
    case ADMIN_CONFIG_OPTIONS.MANAGE_SLAUGHTER_SPECIES:
      control = <AdminManageSlaughterhouseSpecies />;
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
          <option value={null} />
          <option value={ADMIN_CONFIG_OPTIONS.MANAGE_USERS}>
            Manage Users
          </option>
          <option value={ADMIN_CONFIG_OPTIONS.MANAGE_DAIRY_THRESHOLDS}>
            Manage Dairy Test Values
          </option>
          <option value={ADMIN_CONFIG_OPTIONS.MANAGE_LICENCE_TYPES}>
            Manage Licence Types
          </option>
          <option value={ADMIN_CONFIG_OPTIONS.MANAGE_FUR_SPECIES}>
            Manage Fur Species
          </option>
          <option value={ADMIN_CONFIG_OPTIONS.MANAGE_GAME_SPECIES}>
            Manage Game Species
          </option>
          <option value={ADMIN_CONFIG_OPTIONS.MANAGE_SLAUGHTER_SPECIES}>
            Manage Slaughterhouse Species
          </option>
        </Form.Control>

        <div className="mt-5">{control}</div>
      </Container>
    </>
  );
}

AdminConfig.propTypes = {};
