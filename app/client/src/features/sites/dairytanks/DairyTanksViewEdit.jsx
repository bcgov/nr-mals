import React from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Container, Form, Row, Col, Alert } from "react-bootstrap";

import {
  DAIRY_TANK_MODE,
  REQUEST_STATUS,
  SYSTEM_ROLES,
} from "../../../utilities/constants";

import ErrorMessageRow from "../../../components/ErrorMessageRow";
import SectionHeading from "../../../components/SectionHeading";
import SubmissionButtons from "../../../components/SubmissionButtons";

import {
  updateSiteDairyTanks,
  setCurrentSiteDairyTankModeToEdit,
  setCurrentSiteDairyTankModeToView,
} from "../sitesSlice";

import { validateDairyTanks, formatDairyTanks } from "./dairyTankUtility";

import DairyTanksTab from "./DairyTanksTab";

import { selectCurrentUser } from "../../../app/appSlice";

function submissionController(setError, clearErrors, dispatch, siteId) {
  const onSubmit = async (data) => {
    const validationResult = validateDairyTanks(
      data.dairyTanks,
      setError,
      clearErrors
    );
    if (validationResult === false) {
      return;
    }

    const payload = formatDairyTanks(
      data.dairyTanks,
      data.dairyTankDates,
      siteId
    );
    dispatch(updateSiteDairyTanks({ dairyTanks: payload, id: siteId }));
  };

  return { onSubmit };
}

export default function DairyTanksViewEdit({ site }) {
  const {
    status,
    error,
    dairyTankMode: mode,
    data: { dairyTanks },
  } = site;

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
    site.data.id
  );

  if (mode === DAIRY_TANK_MODE.VIEW) {
    const onEdit = () => {
      dispatch(setCurrentSiteDairyTankModeToEdit());
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
          Dairy Tank Details
        </SectionHeading>
        {dairyTanks === undefined ||
        dairyTanks === null ||
        dairyTanks.length === 0 ? (
          <Row className="mt-3">
            <Col>
              <Alert variant="success" className="mt-3">
                <div>
                  There are no dairy tanks currently associated with this site.
                </div>
              </Alert>
            </Col>
          </Row>
        ) : (
          <Container className="mt-3 mb-4">
            <DairyTanksTab initialDairyTanks={dairyTanks} mode={mode} />
          </Container>
        )}
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
    dispatch(setCurrentSiteDairyTankModeToView());
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <section>
        <SectionHeading>Dairy Tank Details</SectionHeading>
        <Container className="mt-3 mb-4">
          <DairyTanksTab
            initialDairyTanks={dairyTanks}
            mode={mode}
            form={form}
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

DairyTanksViewEdit.propTypes = {
  site: PropTypes.object.isRequired,
};
