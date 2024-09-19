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
import { parseAsInt } from "../../utilities/parsing";

import ErrorMessageRow from "../../components/ErrorMessageRow";
import SectionHeading from "../../components/SectionHeading";
import SubmissionButtons from "../../components/SubmissionButtons";

import { fetchRegions } from "../lookups/regionsSlice";
import { fetchLicenceStatuses } from "../lookups/licenceStatusesSlice";
import {
  setCurrentTrailerModeToEdit,
  setCurrentTrailerModeToView,
} from "../trailers/trailersSlice";

import TrailerDetailsEdit from "./TrailerDetailsEdit";
import TrailerDetailsView from "./TrailerDetailsView";

import { fetchCities } from "../lookups/citiesSlice";

import { selectCurrentUser } from "../../app/appSlice";
import { formatDateString } from "../../utilities/formatting";

import { updateTrailer } from "../trailers/trailersSlice";

export default function TrailerDetailsViewEdit({ trailer, licence }) {
  const { status, error, mode } = trailer;

  const dispatch = useDispatch();

  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    dispatch(fetchRegions());
    dispatch(fetchLicenceStatuses());
    dispatch(fetchCities());
  }, [dispatch]);

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { handleSubmit, setValue, setError } = form;

  const initialFormValues = {
    issueDate: null,
    trailerNumber: null,
    geographicalDivision: null,
    serialNumberVIN: null,
    licencePlate: null,
    trailerYear: null,
    trailerMake: null,
    trailerType: null,
    trailerCapacity: null,
    trailerCompartments: null,
    trailerActiveFlag: false,
  };

  //Date Issued, Trailer #, Division, Serial No / VIN; License Plate #, Year, Make, Trailer Type, Capacity, Compartments
  useEffect(() => {
    setValue("issueDate", formatDateString(trailer.data.issueDate));
    setValue("trailerNumber", trailer.data.trailerNumber);
    setValue("geographicalDivision", trailer.data.geographicalDivision);
    setValue("serialNumberVIN", trailer.data.serialNumberVIN);
    setValue("licencePlate", trailer.data.licencePlate);
    setValue("trailerYear", trailer.data.trailerYear);
    setValue("trailerMake", trailer.data.trailerMake);
    setValue("trailerType", trailer.data.trailerType);
    setValue("trailerCapacity", trailer.data.trailerCapacity);
    setValue("trailerCompartments", trailer.data.trailerCompartments);
    setValue("trailerActiveFlag", trailer.data.trailerActiveFlag);
  }, [
    setValue,
    trailer.data.issueDate,
    trailer.data.trailerNumber,
    trailer.data.geographicalDivision,
    trailer.data.serialNumberVIN,
    trailer.data.licencePlate,
    trailer.data.trailerYear,
    trailer.data.trailerMake,
    trailer.data.trailerType,
    trailer.data.trailerCapacity,
    trailer.data.trailerCompartments,
    trailer.data.trailerActiveFlag,
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
  console.log("continuing");

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
      issueDate: trailer.data.issueDate,
      trailerNumber: trailer.data.trailerNumber,
      geographicalDivision: trailer.data.geographicalDivision,
      serialNumberVIN: trailer.data.serialNumberVIN,
      licencePlate: trailer.data.licencePlate,
      trailerYear: parseAsInt(trailer.data.trailerYear),
      trailerMake: trailer.data.trailerMake,
      trailerType: trailer.data.trailerType,
      trailerCapacity: trailer.data.trailerCapacity,
      trailerCompartments: trailer.data.trailerCompartments,
      trailerActiveFlag: trailer.data.trailerActiveFlag,
    };

    dispatch(
      updateTrailer({ trailer: payload, id: trailer.data.dairyFarmTrailerId })
    );
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
