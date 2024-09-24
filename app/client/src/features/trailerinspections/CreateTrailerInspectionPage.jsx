import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Container, Form } from "react-bootstrap";
import { startOfToday } from "date-fns";

import { REQUEST_STATUS, TRAILERS_PATHNAME } from "../../utilities/constants";

import ErrorMessageRow from "../../components/ErrorMessageRow";
import PageHeading from "../../components/PageHeading";
import SectionHeading from "../../components/SectionHeading";
import SubmissionButtons from "../../components/SubmissionButtons";

import {
  selectCreatedInspection,
  createTrailerInspection,
  clearCreatedInspection,
} from "./trailerInspectionsSlice";
import { fetchTrailer, selectCurrentTrailer } from "../trailers/trailersSlice";
import { fetchLicence, selectCurrentLicence } from "../licences/licencesSlice";
import * as LicenceTypeConstants from "../licences/constants";

import TrailerHeader from "../trailers/TrailerHeader";
import TrailerDetailsView from "../trailers/TrailerDetailsView";
import LicenceDetailsView from "../licences/LicenceDetailsView";
import TrailerInspectionDetailsEdit from "./TrailerInspectionDetailsViewEdit";

function submissionController(
  licence,
  trailer,
  setError,
  clearErrors,
  dispatch
) {
  const onSubmit = async (data) => {
    switch (licence.data.licenceTypeId) {
      case LicenceTypeConstants.LICENCE_TYPE_ID_DAIRY_TANK_TRUCK: {
        const payload = {
          ...data,
          trailerId: trailer.data.id,
          trailerNumber: trailer.data.trailerNumber,
          inspectorId: data.inspectorId.length === 0 ? null : data.inspectorId,
          inspectionComment:
            data.inspectionComment.length === 0 ? null : data.inspectionComment,
        };
        dispatch(createTrailerInspection(payload));
        break;
      }
      default:
        break;
    }
  };

  return { onSubmit };
}

const today = startOfToday();
const initialFormValues = {
  inspectionDate: today,
  inspectorId: null,
  inspectionComment: null,
};

export default function CreateTrailerInspectionPage() {
  const history = useHistory();
  const dispatch = useDispatch();

  const { id } = useParams();

  const trailer = useSelector(selectCurrentTrailer);
  const licence = useSelector(selectCurrentLicence);
  const inspection = useSelector(selectCreatedInspection);

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { handleSubmit, setValue, setError, clearErrors } = form;

  useEffect(() => {
    setValue("inspectionDate", today);

    dispatch(clearCreatedInspection());

    dispatch(fetchTrailer(id)).then((s) => {
      dispatch(fetchLicence(s.payload.licenceId));
    });
  }, [dispatch]);

  const onCancel = () => {
    history.push(`${TRAILERS_PATHNAME}/${id}`);
  };

  const { onSubmit } = submissionController(
    licence,
    trailer,
    setError,
    clearErrors,
    dispatch
  );

  const submitting = inspection.status === REQUEST_STATUS.PENDING;

  let errorMessage = null;
  if (inspection.status === REQUEST_STATUS.REJECTED) {
    errorMessage = `${inspection.error.code}: ${inspection.error.description}`;
  }

  const submissionLabel = submitting ? "Submitting..." : "Create";

  if (inspection.status === REQUEST_STATUS.FULFILLED) {
    return <Redirect to={`${TRAILERS_PATHNAME}/${id}`} />;
  }

  let content;
  if (trailer.data && licence.data) {
    content = (
      <>
        <TrailerHeader trailer={trailer.data} licence={licence.data} />
        <section>
          <SectionHeading>License Details</SectionHeading>
          <Container className="mt-3 mb-4">
            <LicenceDetailsView licence={licence.data} />
          </Container>
        </section>
        <section>
          <SectionHeading>Trailer Details</SectionHeading>
          <Container className="mt-3 mb-4">
            <TrailerDetailsView trailer={trailer.data} />
          </Container>
        </section>
      </>
    );
  }

  return (
    <section>
      <PageHeading>Create Inspection</PageHeading>
      {content}
      {trailer.data ? (
        <section>
          <SectionHeading>Inspection Details</SectionHeading>
          <Container className="mt-3 mb-4">
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
              <TrailerInspectionDetailsEdit
                form={form}
                initialValues={initialFormValues}
                trailer={trailer.data}
              />
              <section className="mt-3">
                <SubmissionButtons
                  submitButtonLabel={submissionLabel}
                  submitButtonDisabled={submitting}
                  cancelButtonVisible
                  cancelButtonOnClick={onCancel}
                />
                <ErrorMessageRow errorMessage={errorMessage} />
              </section>
            </Form>
          </Container>
        </section>
      ) : null}
    </section>
  );
}
