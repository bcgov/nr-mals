import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Redirect, useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Alert, Button, Col, Container, Form } from "react-bootstrap";
import { startOfToday, add, set } from "date-fns";

import {
  REQUEST_STATUS,
  LICENSES_PATHNAME,
  LICENCE_MODE,
  REGISTRANT_MODE,
  LICENCE_STATUS_TYPES,
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

import {
  fetchLicenceStatuses,
  selectLicenceStatuses,
} from "../lookups/licenceStatusesSlice";
import { fetchRegions } from "../lookups/regionsSlice";
import {
  createLicence,
  selectCreatedLicence,
  clearCreatedLicence,
} from "./licencesSlice";

import { fetchLicenceSpecies } from "../lookups/licenceSpeciesSlice";
import { fetchCities } from "../lookups/citiesSlice";

import {
  LICENCE_TYPE_ID_APIARY,
  LICENCE_TYPE_ID_LIVESTOCK_DEALER,
  LICENCE_TYPE_ID_PUBLIC_SALE_YARD_OPERATOR,
  LICENCE_TYPE_ID_PURCHASE_LIVE_POULTRY,
} from "./constants";
import { getLicenceTypeConfiguration } from "./licenceTypeUtility";
import { parseIrmaNumber, validateIrmaNumber } from "./irmaNumberUtility";

import LicenceDetailsEdit from "./LicenceDetailsEdit";
import BondInformationEdit from "./BondInformationEdit";

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
  addresses: [],
  phoneNumbers: [],
};

let createDraft = false;
const draftOnClick = () => {
  createDraft = true;
};
let licenceStatuses = null;

function submissionController(setError, clearErrors, dispatch) {
  const onSubmit = async (data) => {
    clearErrors("irmaNumber");

    let validationResult = validateIrmaNumber(data.irmaNumber);
    if (validationResult === false) {
      setError("irmaNumber", {
        type: "invalid",
      });

      return;
    }

    validationResult = validateRegistrants(
      data.registrants,
      setError,
      clearErrors
    );
    if (validationResult === false) {
      return;
    }

    let draftId = null;
    if (createDraft) {
      if (licenceStatuses.data) {
        const draft = licenceStatuses.data.find(
          (x) => x.code_description === LICENCE_STATUS_TYPES.DRAFT
        );
        if (draft !== undefined) {
          draftId = draft.id;
        }
      }
    }

    const payload = {
      ...data,
      feePaidAmount: data.paymentReceived
        ? parseAsFloat(data.feePaidAmount)
        : undefined,
      bondValue: data.bondValue ? parseAsFloat(data.bondValue) : undefined,
      bondCarrierPhoneNumber: data.bondCarrierPhoneNumber
        ? data.bondCarrierPhoneNumber.replace(/\D/g, "")
        : undefined,
      licenceStatus: parseAsInt(
        createDraft && draftId !== null ? draftId : data.licenceStatus
      ),
      licenceType: parseAsInt(data.licenceType),
      region: parseAsInt(data.region),
      regionalDistrict: parseAsInt(data.regionalDistrict),
      irmaNumber: parseIrmaNumber(data.irmaNumber),
      registrants: formatRegistrants(data.registrants),
      primaryRegistrantId: null,
    };

    dispatch(createLicence(payload));
  };

  return { onSubmit };
}

export default function CreateLicencePage() {
  const createdLicence = useSelector(selectCreatedLicence);
  licenceStatuses = useSelector(selectLicenceStatuses);
  const history = useHistory();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchRegions());
    dispatch(fetchLicenceStatuses());
    dispatch(fetchLicenceSpecies());
    dispatch(fetchCities());
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
    Object.entries(initialFormValues).forEach(([field, value]) => {
      setValue(field, value);
    });
  }, [setValue]);

  const watchLicenceType = parseAsInt(
    watch("licenceType", LICENCE_TYPE_ID_APIARY)
  );

  const config = getLicenceTypeConfiguration(watchLicenceType);

  const REQUIRES_BOND_INFORMATION = [
    LICENCE_TYPE_ID_PUBLIC_SALE_YARD_OPERATOR,
    LICENCE_TYPE_ID_PURCHASE_LIVE_POULTRY,
    LICENCE_TYPE_ID_LIVESTOCK_DEALER,
  ];
  const showBondInformation =
    REQUIRES_BOND_INFORMATION.find((x) => x === watchLicenceType) !== undefined;

  // set default expiry date differently based on the selected licence type
  useEffect(() => {
    let expiryDate = null;
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
    } else if (config.replaceExpiryDateWithIrmaNumber) {
      expiryDate = undefined;
    }

    setValue("expiryDate", expiryDate);
    initialFormValues.expiryDate = expiryDate;
  }, [
    setValue,
    config.expiryInTwoYears,
    config.expiryMonth,
    config.yearsAddedToExpiryDate,
    config.replaceExpiryDateWithIrmaNumber,
  ]);

  const { onSubmit } = submissionController(setError, clearErrors, dispatch);

  const submitting = createdLicence.status === REQUEST_STATUS.PENDING;

  let errorMessage = null;
  if (createdLicence.status === REQUEST_STATUS.REJECTED) {
    errorMessage = `${createdLicence.error.code}: ${createdLicence.error.description}`;
  }

  const submissionLabel = submitting ? "Submitting..." : "Create";
  const draftLabel = submitting ? "Submitting..." : "Save Draft";

  const createAnotherLicence = () => {
    dispatch(clearCreatedLicence());
    history.push(`${LICENSES_PATHNAME}/search`);
  };

  if (createdLicence.status === REQUEST_STATUS.FULFILLED) {
    if (createDraft === true) {
      return <Redirect to={`${LICENSES_PATHNAME}/search`} />;
    }
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
                onClick={createAnotherLicence}
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
          </Container>
        </section>
        {showBondInformation ? (
          <section>
            <SectionHeading>Bond Information</SectionHeading>
            <Container className="mt-3 mb-4">
              <BondInformationEdit
                form={form}
                initialValues={initialFormValues}
                licenceTypeId={watchLicenceType}
                mode={LICENCE_MODE.CREATE}
              />
            </Container>
          </section>
        ) : null}
        <section>
          <SectionHeading>Comments</SectionHeading>
          <Container className="mt-3 mb-4">
            <Form.Control
              as="textarea"
              rows={6}
              name="commentText"
              ref={register}
              className="mb-1"
            />
          </Container>
        </section>
        <section>
          <Container className="mt-3 mb-4">
            <SubmissionButtons
              submitButtonLabel={submissionLabel}
              submitButtonDisabled={submitting}
              draftButtonVisible
              draftButtonLabel={draftLabel}
              draftButtonDisabled={submitting}
              draftButtonOnClick={draftOnClick}
            />
            <ErrorMessageRow errorMessage={errorMessage} />
          </Container>
        </section>
      </Form>
    </section>
  );
}
