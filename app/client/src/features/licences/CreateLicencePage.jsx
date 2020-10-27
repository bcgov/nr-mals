import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Alert, Button, Col, Container, Form } from "react-bootstrap";

import {
  REQUEST_STATUS,
  LICENSES_PATHNAME,
  REGISTRANT_MODE,
} from "../../utilities/constants";
import { parseAsInt, parseAsFloat } from "../../utilities/parsing";

import ErrorMessageRow from "../../components/ErrorMessageRow";
import LinkButton from "../../components/LinkButton";
import PageHeading from "../../components/PageHeading";
import SectionHeading from "../../components/SectionHeading";
import SubmissionButtons from "../../components/SubmissionButtons";

import LicenceTypes from "../lookups/LicenceTypes";

import RegistrantsSection from "../registrants/RegistrantsSection";

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

function submissionController(setError, dispatch, values) {
  const validateRegistrants = (registrants) => {
    if (!registrants || registrants.length === 0) {
      setError("noRegistrants", {
        type: "invalid",
        message: "A licence must have at least one registrant.",
      });
      return false;
    }

    let errorCount = 0;

    registrants.forEach((registrant, index) => {
      // validate phone numbers
      if (!registrant.primaryPhone.match(/^$|\(\d{3}\) \d{3}-\d{4}/g)) {
        setError(`registrants[${index}].primaryPhone`, {
          type: "invalid",
        });
        errorCount += 1;
      }

      // validate names
      if (
        !(
          (registrant.firstName.trim().length > 0 &&
            registrant.lastName.trim().length > 0) ||
          registrant.companyName.trim().length > 0
        )
      ) {
        setError(`registrants[${index}].names`, {
          type: "invalid",
        });
        errorCount += 1;
      }
    });

    return errorCount === 0;
  };

  const formatRegistrants = (registrants) => {
    if (registrants === undefined) {
      return undefined;
    }

    return registrants.map((registrant) => {
      return {
        ...registrant,
        primaryPhone: registrant.primaryPhone.replace(/\D/g, ""),
      };
    });
  };

  const onSubmit = async (data) => {
    const validationResult = validateRegistrants(data.registrants);
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

  const onInvalid = () => {
    // re-validate so errors that have been cleared but not fixed will appear once again
    validateRegistrants(values.registrants);
  };

  return { onSubmit, onInvalid };
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
  const { register, handleSubmit, getValues, setValue, setError } = form;

  useEffect(() => {
    register("applicationDate");
    register("issuedOnDate", { required: true });
    register("expiryDate");
  }, [register]);

  useEffect(() => {
    formFields.forEach((field) => setValue(field, initialFormValues[field]));
  }, [setValue]);

  const values = getValues();
  const { onSubmit, onInvalid } = submissionController(
    setError,
    dispatch,
    values
  );

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
      <Form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
        <section>
          <Container>
            <Form.Row>
              <Col sm={6}>
                <LicenceTypes ref={register} />
              </Col>
            </Form.Row>
          </Container>
        </section>
        <RegistrantsSection mode={REGISTRANT_MODE.CREATE} form={form} />
        <section>
          <SectionHeading>License Details</SectionHeading>
          <Container>
            <LicenceDetailsEdit form={form} initialValues={initialFormValues} />
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
