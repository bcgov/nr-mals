import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  InputGroup,
} from "react-bootstrap";

import {
  REQUEST_STATUS,
  LICENSES_PATHNAME,
  REGISTRANT_MODE,
} from "../../utilities/constants";
import { parseAsInt, parseAsFloat } from "../../utilities/parsing";

import CustomCheckBox from "../../components/CustomCheckBox";
import CustomDatePicker from "../../components/CustomDatePicker";
import LinkButton from "../../components/LinkButton";
import PageHeading from "../../components/PageHeading";
import SectionHeading from "../../components/SectionHeading";

import LicenceTypes from "../lookups/LicenceTypes";
import LicenceStatuses from "../lookups/LicenceStatuses";
import Regions from "../lookups/Regions";
import RegionalDistricts from "../lookups/RegionalDistricts";

import RegistrantsSection from "../registrants/RegistrantsSection";

import { fetchRegions, selectRegions } from "../lookups/regionsSlice";
import {
  createLicence,
  selectCreatedLicence,
  clearCreatedLicence,
} from "./licencesSlice";

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
      feePaidAmount: parseAsFloat(data.feePaidAmount),
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

export default function LicencesCreate() {
  const regions = useSelector(selectRegions);
  const createdLicence = useSelector(selectCreatedLicence);
  const dispatch = useDispatch();

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const {
    register,
    handleSubmit,
    errors,
    watch,
    getValues,
    setValue,
    setError,
  } = form;

  const values = getValues();
  const { onSubmit, onInvalid } = submissionController(
    setError,
    dispatch,
    values
  );

  useEffect(() => {
    dispatch(fetchRegions());
  }, [dispatch]);

  useEffect(() => {
    const today = new Date(new Date().setHours(0, 0, 0, 0));

    register("applicationDate");
    setValue("applicationDate", today);
    register("issuedOnDate", { required: true });
    setValue("issuedOnDate", today);
    register("expiryDate");
    setValue("expiryDate", null);
  }, [register, setValue]);

  const handleFieldChange = (field) => {
    return (value) => {
      setValue(field, value);
    };
  };

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

  const watchPaymentReceived = watch("paymentReceived", false);
  const watchRegion = watch("region", null);

  const parsedRegion = parseAsInt(watchRegion);

  const today = new Date(new Date().setHours(0, 0, 0, 0));

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
          <SectionHeading>Licence Details</SectionHeading>
          <Container>
            <Form.Row>
              <Col sm={4}>
                <CustomDatePicker
                  id="applicationDate"
                  label="Application Date"
                  notifyOnChange={handleFieldChange("applicationDate")}
                  defaultValue={today}
                />
              </Col>
              <Col sm={8}>
                <Regions
                  regions={regions}
                  ref={register}
                  isInvalid={errors.region}
                />
              </Col>
            </Form.Row>
            <Form.Row>
              <Col sm={4}>
                <CustomDatePicker
                  id="issuedOnDate"
                  label="Issued On"
                  notifyOnChange={handleFieldChange("issuedOnDate")}
                  defaultValue={today}
                  isInvalid={errors.issuedOnDate}
                />
              </Col>
              <Col sm={8}>
                <RegionalDistricts
                  regions={regions}
                  selectedRegion={parsedRegion}
                  ref={register}
                  isInvalid={errors.regionalDistrict}
                />
              </Col>
            </Form.Row>
            <Form.Row>
              <Col sm={4}>
                <CustomDatePicker
                  id="expiryDate"
                  label="Expiry Date"
                  notifyOnChange={handleFieldChange("expiryDate")}
                />
              </Col>
              <Col sm={8}>
                <LicenceStatuses ref={register} />
              </Col>
            </Form.Row>
            <Form.Row>
              <Col md={4}>
                <Form.Group controlId="paymentReceived">
                  <CustomCheckBox
                    id="paymentReceived"
                    label="Payment Received"
                    ref={register}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                {watchPaymentReceived && (
                  <Form.Group controlId="feePaidAmount">
                    <Form.Label>Fee Paid Amount</Form.Label>
                    <InputGroup>
                      <InputGroup.Prepend>
                        <InputGroup.Text>$</InputGroup.Text>
                      </InputGroup.Prepend>
                      <Form.Control
                        type="text"
                        name="feePaidAmount"
                        ref={register({
                          required: true,
                          pattern: /^(\d|[1-9]\d+)(\.\d{2})?$/i,
                        })}
                        isInvalid={errors.feePaidAmount}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please enter a valid monetary amount.
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                )}
              </Col>
            </Form.Row>
            <Form.Row>
              <Col sm={4}>
                <Form.Group controlId="actionRequired">
                  <CustomCheckBox
                    id="actionRequired"
                    label="Action Required"
                    ref={register}
                  />
                </Form.Group>
              </Col>
              <Col sm={4}>
                <Form.Group controlId="printLicence">
                  <CustomCheckBox
                    id="printLicence"
                    label="Print Licence"
                    ref={register}
                  />
                </Form.Group>
              </Col>
              <Col sm={4}>
                <Form.Group controlId="renewalNotice">
                  <CustomCheckBox
                    id="renewalNotice"
                    label="Renewal Notice"
                    ref={register}
                  />
                </Form.Group>
              </Col>
            </Form.Row>
            <Form.Row>
              <Col sm={4} />
              <Col sm={4} />
              <Col sm={4}>
                <Form.Group>
                  <Button
                    type="submit"
                    disabled={createdLicence.status === REQUEST_STATUS.PENDING}
                    variant="primary"
                    block
                  >
                    {createdLicence.status === REQUEST_STATUS.PENDING
                      ? "Submitting..."
                      : "Create"}
                  </Button>
                </Form.Group>
              </Col>
            </Form.Row>
            {createdLicence.status === REQUEST_STATUS.REJECTED && (
              <Form.Row>
                <Col sm={12}>
                  <Alert variant="danger">
                    <Alert.Heading>
                      An error was encountered while submitting the form.
                    </Alert.Heading>
                    <p>
                      {`${createdLicence.error.code}: ${createdLicence.error.description}`}
                    </p>
                  </Alert>
                </Col>
              </Form.Row>
            )}
          </Container>
        </section>
      </Form>
    </section>
  );
}
