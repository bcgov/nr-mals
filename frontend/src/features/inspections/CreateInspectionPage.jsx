import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Redirect,
  useHistory,
  useLocation,
  useParams,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { Container, Form } from "react-bootstrap";
import { startOfToday } from "date-fns";

import {
  REQUEST_STATUS,
  SITES_PATHNAME,
  LICENSES_PATHNAME,
} from "../../utilities/constants";
import { parseAsInt, parseAsFloat } from "../../utilities/parsing";

import ErrorMessageRow from "../../components/ErrorMessageRow";
import PageHeading from "../../components/PageHeading";
import SectionHeading from "../../components/SectionHeading";
import SubmissionButtons from "../../components/SubmissionButtons";

import {
  selectCreatedInspection,
  createApiaryInspection,
  clearCreatedInspection,
} from "./inspectionsSlice";
import { fetchSite, selectCurrentSite } from "../sites/sitesSlice";
import { fetchLicence, selectCurrentLicence } from "../licences/licencesSlice";
import * as LicenceTypeConstants from "../licences/constants";

import ApiaryInspectionDetailsEdit from "./ApiaryInspectionDetailsEdit";
import SiteHeader from "../sites/SiteHeader";
import SiteDetailsView from "../sites/SiteDetailsView";
import LicenceDetailsView from "../licences/LicenceDetailsView";

function submissionController(licence, site, setError, clearErrors, dispatch) {
  const onSubmit = async (data) => {
    switch (licence.data.licenceTypeId) {
      case LicenceTypeConstants.LICENCE_TYPE_ID_APIARY: {
        const payload = {
          ...data,
          siteId: site.data.id,
          inspectorId: data.inspectorId.length === 0 ? null : data.inspectorId,
          liveColonies: parseAsInt(data.liveColonies),
          coloniesTested: parseAsInt(data.coloniesTested),
          broodTested: parseAsInt(data.broodTested),
          varroaTested: parseAsInt(data.varroaTested),
          smallHiveBeetleTested: parseAsInt(data.smallHiveBeetleTested),
          americanFoulbroodResult: parseAsInt(data.americanFoulbroodResult),
          europeanFoulbroodResult: parseAsInt(data.europeanFoulbroodResult),
          smallHiveBeetleResult: parseAsInt(data.smallHiveBeetleResult),
          chalkbroodResult: parseAsInt(data.chalkbroodResult),
          sacbroodResult: parseAsInt(data.sacbroodResult),
          nosemaResult: parseAsInt(data.nosemaResult),
          varroaMiteResult: parseAsInt(data.varroaMiteResult),
          varroaMiteResultPercent: parseAsFloat(data.varroaMiteResultPercent),
          // ?? null so clearing the field on edit actually clears it
          varroaAvgYard: parseAsFloat(data.varroaAvgYard) ?? null,
          inspectionTypeId: parseAsInt(data.inspectionTypeId) ?? null,
          otherResultDescription:
            data.otherResultDescription.length === 0
              ? null
              : data.otherResultDescription,
          supersInspected: parseAsInt(data.supersInspected),
          supersDestroyed: parseAsInt(data.supersDestroyed),
          inspectionComment:
            data.inspectionComment.length === 0 ? null : data.inspectionComment,
        };
        dispatch(createApiaryInspection(payload));
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
  liveColonies: null,
  coloniesTested: null,
  broodTested: null,
  varroaTested: null,
  smallHiveBeetleTested: null,
  americanFoulbroodResult: null,
  europeanFoulbroodResult: null,
  smallHiveBeetleResult: null,
  chalkbroodResult: null,
  sacbroodResult: null,
  nosemaResult: null,
  varroaMiteResult: null,
  varroaMiteResultPercent: null,
  varroaAvgYard: null,
  inspectionTypeId: null,
  otherResultDescription: null,
  supersInspected: null,
  supersDestroyed: null,
  inspectionComment: null,
};

export default function CreateInspectionPage() {
  const history = useHistory();
  const dispatch = useDispatch();

  const { id } = useParams();
  const location = useLocation();

  // When launched from the licence page's Inspection Details section, return there afterwards
  const returnToLicenceId = location.state?.returnToLicenceId;
  const returnPath = returnToLicenceId
    ? `${LICENSES_PATHNAME}/${returnToLicenceId}`
    : `${SITES_PATHNAME}/${id}`;

  const site = useSelector(selectCurrentSite);
  const licence = useSelector(selectCurrentLicence);
  const inspection = useSelector(selectCreatedInspection);

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { handleSubmit, setValue, setError, clearErrors } = form;

  useEffect(() => {
    setValue("inspectionDate", today);

    dispatch(clearCreatedInspection());

    dispatch(fetchSite(id)).then((s) => {
      dispatch(fetchLicence(s.payload.licenceId));
    });
  }, [dispatch]);

  const onCancel = () => {
    history.push(returnPath);
  };

  const { onSubmit } = submissionController(
    licence,
    site,
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
    return <Redirect to={returnPath} />;
  }

  let content;
  if (site.data && licence.data) {
    content = (
      <>
        <SiteHeader site={site.data} licence={licence.data} />
        <section>
          <SectionHeading>License Details</SectionHeading>
          <Container className="mt-3 mb-4">
            <LicenceDetailsView licence={licence.data} />
          </Container>
        </section>
        <section>
          <SectionHeading>Site Details</SectionHeading>
          <Container className="mt-3 mb-4">
            <SiteDetailsView
              site={site.data}
              licenceTypeId={licence.data.licenceTypeId}
            />
          </Container>
        </section>
      </>
    );
  }

  return (
    <section>
      <PageHeading>Create Inspection</PageHeading>
      {content}
      {site.data ? (
        <section>
          <SectionHeading>Inspection Details</SectionHeading>
          <Container className="mt-3 mb-4">
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
              <ApiaryInspectionDetailsEdit
                form={form}
                initialValues={initialFormValues}
                site={site.data}
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
