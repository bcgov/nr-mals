import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Alert, Button, Col, Container, Form } from "react-bootstrap";
import { startOfToday, add, set } from "date-fns";

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

import { LICENCE_TYPE_ID_APIARY } from "./constants";
import { getLicenceTypeConfiguration } from "./licenceTypeUtility";

import LicenceDetailsEdit from "./LicenceDetailsEdit";

const today = startOfToday();
const initialFormValues = {
  applicationDate: today,
  region: null,
  issuedOnDate: today,
  regionalDistrict: null,
  expiryDate: add(today, { years: 2 }),
  actionRequired: false,
  printLicence: false,
  renewalNotice: false,
  // don't specify a default licenceStatus so it defaults to the first option, Active
  // initial licence type is apiary
  // paymentReceived: false,
  // feePaidAmount: null,
  totalHives: null,
  hivesPerApiary: null,
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
        : undefined,
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
  const {
    register,
    watch,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
  } = form;

  useEffect(() => {
    register("applicationDate");
    register("issuedOnDate", { required: true });
    register("expiryDate");
  }, [register]);

  useEffect(() => {
    for (const [field, value] of Object.entries(initialFormValues)) {
      setValue(field, value);
    }
  }, [setValue]);

  const watchLicenceType = parseAsInt(
    watch("licenceType", LICENCE_TYPE_ID_APIARY)
  );

  const config = getLicenceTypeConfiguration(watchLicenceType);

  // set default expiry date differently based on the selected licence type
  useEffect(() => {
    let expiryDate;
    if (config.expiryInTwoYears) {
      expiryDate = add(today, { years: 2 });
    } else if (config.expiryMonth) {
      expiryDate = set(today, { date: 31, month: config.expiryMonth - 1 }); // months are indexed at 0
      if (expiryDate < today) {
        expiryDate = add(expiryDate, { years: 1 });
      }
      if (config.yearsAddedToExpiryDate) {
        expiryDate = add(expiryDate, { years: config.yearsAddedToExpiryDate });
      }
    }

    if (expiryDate) {
      setValue("expiryDate", expiryDate);
      initialFormValues["expiryDate"] = expiryDate;
    }
  }, [setValue, watchLicenceType]);

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
              licenceTypeId={watchLicenceType}
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
