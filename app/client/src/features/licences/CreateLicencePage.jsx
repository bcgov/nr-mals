import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Alert, Button, Col, Container, Form } from "react-bootstrap";

import {
  REQUEST_STATUS,
  LICENSES_PATHNAME,
  LICENCE_MODE,
  REGISTRANT_MODE,
} from "../../utilities/constants";
import { parseAsInt, parseAsFloat } from "../../utilities/parsing";

import ErrorMessageRow from "../../components/ErrorMessageRow";
import LinkButton from "../../components/LinkButton";
import PageHeading from "../../components/PageHeading";
import SectionHeading from "../../components/SectionHeading";
import SubmissionButtons from "../../components/SubmissionButtons";

import LicenceTypes from "../lookups/LicenceTypes";

import RegistrantsTab from "../registrants/RegistrantsTab";

import {
  validateRegistrants,
  formatRegistrants,
} from "../registrants/registrantUtility";

import { fetchLicenceStatuses } from "../lookups/licenceStatusesSlice";
import { fetchRegions } from "../lookups/regionsSlice";
import {
  createLicence,
  selectCreatedLicence,
  clearCreatedLicence,
} from "./licencesSlice";

import { formFields } from "./constants";

import LicenceDetailsEdit from "./LicenceDetailsEdit";

const today = new Date(new Date().setHours(0, 0, 0, 0));
const initialFormValues = {
  applicationDate: today,
  region: null,
  issuedOnDate: today,
  regionalDistrict: null,
  expiryDate: null,
  paymentReceived: null,
  feePaidAmount: null,
  actionRequired: null,
  printLicence: null,
  renewalNotice: null,
  // don't specify a default licenceStatus so it defaults to the first option, Active
};

function submissionController(setError, clearErrors, dispatch) {
  const onSubmit = async (data) => {
    const validationResult = validateRegistrants(
      data.registrants,
      setError,
      clearErrors
    );
    if (validationResult === false) {
      return;
    }

    const payload = {
      ...data,
      feePaidAmount: data.paymentReceived
        ? parseAsFloat(data.feePaidAmount)
        : null,
      licenceStatus: parseAsInt(data.licenceStatus),
      licenceType: parseAsInt(data.licenceType),
      region: parseAsInt(data.region),
      regionalDistrict: parseAsInt(data.regionalDistrict),
      registrants: formatRegistrants(data.registrants),
    };

    dispatch(createLicence(payload));
  };

  return { onSubmit };
}

export default function CreateLicencePage() {
  const createdLicence = useSelector(selectCreatedLicence);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchRegions());
    dispatch(fetchLicenceStatuses());
  }, [dispatch]);

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, handleSubmit, setValue, setError, clearErrors } = form;

  useEffect(() => {
    register("applicationDate");
    register("issuedOnDate", { required: true });
    register("expiryDate");
  }, [register]);

  useEffect(() => {
    formFields.forEach((field) => setValue(field, initialFormValues[field]));
  }, [setValue]);

  const { onSubmit } = submissionController(setError, clearErrors, dispatch);

  const submitting = createdLicence.status === REQUEST_STATUS.PENDING;

  let errorMessage = null;
  if (createdLicence.status === REQUEST_STATUS.REJECTED) {
    errorMessage = `${createdLicence.error.code}: ${createdLicence.error.description}`;
  }

  const submissionLabel = submitting ? "Submitting..." : "Create";

  if (createdLicence.status === REQUEST_STATUS.FULFILLED) {
    return (
      <section>
        <PageHeading>Create a Licence</PageHeading>
        <Alert variant="success">The licence has been created.</Alert>
        <Form>
          <Form.Row>
            <Col sm={4}>
              <Link
                to={`${LICENSES_PATHNAME}/${createdLicence.data.id}`}
                component={LinkButton}
                variant="primary"
                block
              >
                View Licence
              </Link>
            </Col>
            <Col sm={4} />
            <Col sm={4}>
              <Button
                type="button"
                onClick={() => dispatch(clearCreatedLicence())}
                variant="primary"
                block
              >
                Create Another Licence
              </Button>
            </Col>
          </Form.Row>
        </Form>
      </section>
    );
  }

  return (
    <section>
      <PageHeading>Create a Licence</PageHeading>
      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        <section>
          <Container>
            <Form.Row>
              <Col sm={6}>
                <LicenceTypes ref={register} />
              </Col>
            </Form.Row>
          </Container>
        </section>
        <section>
          <SectionHeading>Registrant Details</SectionHeading>
          <Container className="mt-3 mb-4">
            <RegistrantsTab mode={REGISTRANT_MODE.CREATE} form={form} />
          </Container>
        </section>
        <section>
          <SectionHeading>License Details</SectionHeading>
          <Container className="mt-3 mb-4">
            <LicenceDetailsEdit
              form={form}
              initialValues={initialFormValues}
              mode={LICENCE_MODE.CREATE}
            />
            <SubmissionButtons
              submitButtonLabel={submissionLabel}
              submitButtonDisabled={submitting}
            />
            <ErrorMessageRow errorMessage={errorMessage} />
          </Container>
        </section>
      </Form>
    </section>
  );
}
