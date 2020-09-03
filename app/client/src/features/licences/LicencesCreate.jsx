import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { Alert, Button, Col, Form, InputGroup } from "react-bootstrap";

import { REQUEST_STATUS } from "../../utilities/constants";
import { parseAsInt, parseAsFloat } from "../../utilities/parsing.ts";

import CustomCheckBox from "../../components/CustomCheckBox";
import CustomDatePicker from "../../components/CustomDatePicker";

import LicenceTypes from "../lookups/LicenceTypes";
import LicenceStatuses from "../lookups/LicenceStatuses";
import Regions from "../lookups/Regions";
import RegionalDistricts from "../lookups/RegionalDistricts";

import { fetchRegions, selectRegions } from "../lookups/regionsSlice";
import {
  createLicence,
  selectCreatedLicence,
  clearCreatedLicence,
} from "./licencesSlice";

export default function CreateLicence() {
  const regions = useSelector(selectRegions);
  const createdLicence = useSelector(selectCreatedLicence);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchRegions());
  }, [dispatch]);

  const {
    register,
    handleSubmit,
    errors,
    watch,
    formState,
    setValue,
  } = useForm();

  const today = new Date(new Date().setHours(0, 0, 0, 0));

  useEffect(() => {
    register("applicationDate");
    setValue("applicationDate", today);
    register("issuedOnDate", { required: true });
    setValue("issuedOnDate", today);
    register("expiryDate");
    setValue("expiryDate", null);
  });

  const handleFieldChange = (field) => {
    return (value) => {
      setValue(field, value);
    };
  };

  if (createdLicence.status === REQUEST_STATUS.FULFILLED) {
    return (
      <section>
        <h2>Create a Licence</h2>
        <Alert variant="success">The licence has been created.</Alert>
        <Form>
          <Form.Row>
            <Col sm={4} />
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

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      feePaidAmount: parseAsFloat(data.feePaidAmount),
      licenceStatus: parseAsInt(data.licenceStatus),
      licenceType: parseAsInt(data.licenceType),
      region: parseAsInt(data.region),
      regionalDistrict: parseAsInt(data.regionalDistrict),
    };

    dispatch(createLicence(payload));
  };

  return (
    <section>
      <h2>Create a Licence</h2>
      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Form.Row>
          <Col sm={6}>
            <LicenceTypes ref={register} />
          </Col>
        </Form.Row>
        <h3>Licence Details</h3>
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
              ref={register({ required: true })}
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
              ref={register({ required: true })}
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
            <Button
              type="submit"
              disabled={formState.isSubmitting}
              variant="primary"
              block
            >
              Create
            </Button>
          </Col>
        </Form.Row>
      </Form>
    </section>
  );
}
