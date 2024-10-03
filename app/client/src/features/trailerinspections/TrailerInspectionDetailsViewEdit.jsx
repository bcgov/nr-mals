import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Container, Form } from "react-bootstrap";
import { startOfToday } from "date-fns";

import {
  LICENCE_MODE,
  REQUEST_STATUS,
  SYSTEM_ROLES,
} from "../../utilities/constants.js";
import { formatNumber } from "../../utilities/formatting.ts";
import { parseAsDate } from "../../utilities/parsing.js";

import ErrorMessageRow from "../../components/ErrorMessageRow.jsx";
import SectionHeading from "../../components/SectionHeading.jsx";
import SubmissionButtons from "../../components/SubmissionButtons.jsx";

import {
  updateTrailerInspection,
  setCurrentInspectionModeToEdit,
  setCurrentInspectionModeToView,
} from "./trailerInspectionsSlice.js";

import TrailerInspectionDetailsEdit from "./TrailerInspectionDetailsEdit.jsx";
import TrailerInspectionDetailsView from "./TrailerInspectionDetailsView.jsx";

import * as LicenceTypeConstants from "../licences/constants.js";

import { selectCurrentUser } from "../../app/appSlice.js";

export default function TrailerInspectionDetailsViewEdit({
  inspection,
  trailer,
  licence,
}) {
  const { status, error, mode } = inspection;

  const dispatch = useDispatch();

  const currentUser = useSelector(selectCurrentUser);

  const today = startOfToday();

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { handleSubmit, setValue } = form;

  const initialFormValues = {
    inspectionDate: inspection.data
      ? parseAsDate(inspection.data.inspectionDate)
      : today,
    inspectorId: null,
    inspectionComment: null,
  };

  useEffect(() => {}, [dispatch]);

  useEffect(() => {
    setValue("inspectionDate", new Date(inspection.data.inspectionDate));
    setValue("inspectorId", formatNumber(inspection.data.inspectorId));
    setValue("inspectionComment", inspection.data.inspectionComment);
  }, [
    setValue,
    inspection.data.inspectionDate,
    inspection.data.inspectorId,
    inspection.data.inspectionComment,
    mode,
  ]);

  if (mode === LICENCE_MODE.VIEW) {
    const onEdit = () => {
      dispatch(setCurrentInspectionModeToEdit());
    };
    return (
      <section>
        <SectionHeading
          onEdit={onEdit}
          showEditButton={currentUser.data.roleId !== SYSTEM_ROLES.READ_ONLY}
        >
          Inspection Details
        </SectionHeading>
        <Container className="mt-3 mb-4">
          <TrailerInspectionDetailsView
            inspection={inspection.data}
            trailer={trailer.data}
          />
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

  const onSubmit = async (data) => {
    switch (licence.data.licenceTypeId) {
      case LicenceTypeConstants.LICENCE_TYPE_ID_DAIRY_TANK_TRUCK: {
        const payload = {
          ...data,
          trailerId: trailer.data.id,
          inspectorId: data.inspectorId.length === 0 ? null : data.inspectorId,
          inspectionComment:
            data.inspectionComment?.length === 0
              ? null
              : data.inspectionComment,
        };

        dispatch(
          updateTrailerInspection({
            inspection: payload,
            id: inspection.data.id,
          })
        );
        break;
      }
      default:
        break;
    }
  };

  const onCancel = () => {
    dispatch(setCurrentInspectionModeToView());
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <section>
        <SectionHeading>Inspection Details</SectionHeading>
        <Container className="mt-3 mb-4">
          <TrailerInspectionDetailsEdit
            form={form}
            initialValues={initialFormValues}
            trailer={trailer.data}
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

TrailerInspectionDetailsViewEdit.propTypes = {
  inspection: PropTypes.object.isRequired,
  trailer: PropTypes.object.isRequired,
  licence: PropTypes.object.isRequired,
};
