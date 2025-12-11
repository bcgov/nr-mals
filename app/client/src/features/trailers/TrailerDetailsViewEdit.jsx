import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Container, Form } from "react-bootstrap";

import {
  LICENCE_MODE,
  REQUEST_STATUS,
  SYSTEM_ROLES,
} from "../../utilities/constants";
import { formatNumber } from "../../utilities/formatting";
import { parseAsDate, parseAsInt } from "../../utilities/parsing";

import ErrorMessageRow from "../../components/ErrorMessageRow";
import SectionHeading from "../../components/SectionHeading";
import SubmissionButtons from "../../components/SubmissionButtons";

import { fetchLicenceStatuses } from "../lookups/licenceStatusesSlice";
import {
  setCurrentTrailerModeToEdit,
  setCurrentTrailerModeToView,
} from "../trailers/trailersSlice";

import TrailerDetailsEdit from "./TrailerDetailsEdit";
import TrailerDetailsView from "./TrailerDetailsView";

import { selectCurrentUser } from "../../app/appSlice";
import { formatDateString } from "../../utilities/formatting";

import { updateTrailer } from "../trailers/trailersSlice";

export default function TrailerDetailsViewEdit({ trailer, licence }) {
  const { status, error, mode } = trailer;

  const dispatch = useDispatch();

  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    dispatch(fetchLicenceStatuses());
  }, [dispatch]);

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { handleSubmit, setValue, setError } = form;

  const initialFormValues = {
    licenceStatus: null,
    dateIssued: trailer.data ? parseAsDate(trailer.data.dateIssued) : null,
    trailerNumber: null,
    geographicalDivision: null,
    serialNumberVIN: null,
    licensePlate: null,
    trailerYear: null,
    trailerMake: null,
    trailerType: null,
    trailerCapacity: null,
    trailerCompartments: null,
  };

  useEffect(() => {
    setValue("licenceStatus", trailer.data.licenceStatusId);
    setValue("dateIssued", formatDateString(trailer.data.dateIssued));
    setValue("trailerNumber", trailer.data.trailerNumber);
    setValue("geographicalDivision", trailer.data.geographicalDivision);
    setValue("serialNumberVIN", trailer.data.serialNumberVIN);
    setValue("licensePlate", trailer.data.licensePlate);
    setValue("trailerYear", formatNumber(trailer.data.trailerYear));
    setValue("trailerMake", trailer.data.trailerMake);
    setValue("trailerType", trailer.data.trailerType);
    setValue("trailerCapacity", formatNumber(trailer.data.trailerCapacity));
    setValue(
      "trailerCompartments",
      formatNumber(trailer.data.trailerCompartments)
    );
  }, [
    setValue,
    trailer.data.licenceStatusId,
    trailer.data.dateIssued,
    trailer.data.trailerNumber,
    trailer.data.geographicalDivision,
    trailer.data.serialNumberVIN,
    trailer.data.licensePlate,
    trailer.data.trailerYear,
    trailer.data.trailerMake,
    trailer.data.trailerType,
    trailer.data.trailerCapacity,
    trailer.data.trailerCompartments,
    mode,
  ]);

  if (mode === LICENCE_MODE.VIEW) {
    const onEdit = () => {
      dispatch(setCurrentTrailerModeToEdit());
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
          Trailer Details
        </SectionHeading>
        <Container className="mt-3 mb-4">
          <TrailerDetailsView trailer={trailer.data} />
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
    let errorCount = 0;

    // error checks

    if (errorCount > 0) {
      return;
    }

    const payload = {
      ...data,
      licenceId: parseAsInt(trailer.data.licenceId),
      licenceStatus: parseAsInt(data.licenceStatus),
      dateIssued: data.dateIssued ? data.dateIssued : null,
      trailerNumber: data.trailerNumber,
      geographicalDivision: data.geographicalDivision,
      serialNumberVIN: data.serialNumberVIN,
      licensePlate: data.licensePlate,
      trailerYear: parseAsInt(data.trailerYear),
      trailerMake: data.trailerMake,
      trailerType: data.trailerType,
      trailerCapacity: parseAsInt(data.trailerCapacity),
      trailerCompartments: parseAsInt(data.trailerCompartments),
    };

    dispatch(updateTrailer({ trailer: payload, id: trailer.data.id }));
  };

  const onCancel = () => {
    dispatch(setCurrentTrailerModeToView());
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <section>
        <SectionHeading>Trailer Details</SectionHeading>
        <Container className="mt-3 mb-4">
          <TrailerDetailsEdit
            form={form}
            initialValues={initialFormValues}
            mode={LICENCE_MODE.EDIT}
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

TrailerDetailsViewEdit.propTypes = {
  trailer: PropTypes.object.isRequired,
};
