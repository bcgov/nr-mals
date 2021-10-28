import React from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Container, Form } from "react-bootstrap";

import {
  REGISTRANT_MODE,
  REQUEST_STATUS,
  SYSTEM_ROLES,
} from "../../utilities/constants";

import ErrorMessageRow from "../../components/ErrorMessageRow";
import SectionHeading from "../../components/SectionHeading";
import SubmissionButtons from "../../components/SubmissionButtons";

import {
  updateLicenceRegistrants,
  setCurrentLicenceRegistrantModeToEdit,
  setCurrentLicenceRegistrantModeToView,
} from "../licences/licencesSlice";

import { selectCurrentUser } from "../../app/appSlice";

import { validateRegistrants, formatRegistrants } from "./registrantUtility";

import RegistrantsTab from "./RegistrantsTab";

function submissionController(setError, clearErrors, dispatch, licenceId) {
  const onSubmit = async (data) => {
    const validationResult = validateRegistrants(
      data.registrants,
      setError,
      clearErrors
    );
    if (validationResult === false) {
      return;
    }

    const payload = formatRegistrants(data.registrants);

    dispatch(updateLicenceRegistrants({ registrants: payload, id: licenceId }));
  };

  return { onSubmit };
}

export default function RegistrantsViewEdit({ licence }) {
  const {
    status,
    error,
    registrantMode: mode,
    data: { registrants },
  } = licence;

  const dispatch = useDispatch();

  const currentUser = useSelector(selectCurrentUser);

  const form = useForm({
    reValidateMode: "onBlur",
  });

  const { handleSubmit, setError, clearErrors } = form;

  const { onSubmit } = submissionController(
    setError,
    clearErrors,
    dispatch,
    licence.data.id
  );

  if (mode === REGISTRANT_MODE.VIEW) {
    const onEdit = () => {
      dispatch(setCurrentLicenceRegistrantModeToEdit());
    };
    return (
      <section>
        <SectionHeading
          onEdit={onEdit}
          showEditButton={
            currentUser.data.roleId !== SYSTEM_ROLES.READ_ONLY &&
            currentUser.data.roleId !== SYSTEM_ROLES.INSPECTOR
          }
        >
          Registrant Details
        </SectionHeading>
        <Container className="mt-3 mb-4">
          <RegistrantsTab initialRegistrants={registrants} mode={mode} />
        </Container>
      </section>
    );
  }

  const submitting = status === REQUEST_STATUS.PENDING;

  let errorMessage = null;
  if (status === REQUEST_STATUS.REJECTED) {
    errorMessage = `${error.code}: ${error.description}`;
  }

  const submissionLabel = submitting ? "Saving..." : "Save";

  const onCancel = () => {
    dispatch(setCurrentLicenceRegistrantModeToView());
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <section>
        <SectionHeading>Registrant Details</SectionHeading>
        <Container className="mt-3 mb-4">
          <RegistrantsTab
            initialRegistrants={registrants}
            mode={mode}
            form={form}
            submitting={submitting}
          />
          <SubmissionButtons
            submitButtonLabel={submissionLabel}
            submitButtonDisabled={submitting}
            cancelButtonVisible
            cancelButtonOnClick={onCancel}
          />
          <ErrorMessageRow errorMessage={errorMessage} />
        </Container>
      </section>
    </Form>
  );
}

RegistrantsViewEdit.propTypes = {
  licence: PropTypes.object.isRequired,
};
