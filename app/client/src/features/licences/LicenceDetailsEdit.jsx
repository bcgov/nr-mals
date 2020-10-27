import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Form, Col, InputGroup } from "react-bootstrap";

import { parseAsInt } from "../../utilities/parsing";

import CustomCheckBox from "../../components/CustomCheckBox";
import CustomDatePicker from "../../components/CustomDatePicker";

import { selectRegions } from "../lookups/regionsSlice";

import LicenceStatuses from "../lookups/LicenceStatuses";
import Regions from "../lookups/Regions";
import RegionalDistricts from "../lookups/RegionalDistricts";

export default function LicenceDetailsEdit({ form, initialValues }) {
  const { watch, setValue, register, errors } = form;

  const regions = useSelector(selectRegions);

  const handleFieldChange = (field) => {
    return (value) => {
      setValue(field, value);
    };
  };

  const watchPaymentReceived = watch("paymentReceived", false);
  const watchRegion = watch("region", null);

  const parsedRegion = parseAsInt(watchRegion);

  return (
    <>
      <Form.Row>
        <Col lg={4}>
          <CustomDatePicker
            id="applicationDate"
            label="Application Date"
            notifyOnChange={handleFieldChange("applicationDate")}
            defaultValue={initialValues.applicationDate}
          />
        </Col>
        <Col lg={8}>
          <Regions
            regions={regions}
            ref={register}
            defaultValue={initialValues.region}
            isInvalid={errors.region}
          />
        </Col>
      </Form.Row>
      <Form.Row>
        <Col lg={4}>
          <CustomDatePicker
            id="issuedOnDate"
            label="Issued On"
            notifyOnChange={handleFieldChange("issuedOnDate")}
            defaultValue={initialValues.issuedOnDate}
            isInvalid={errors.issuedOnDate}
          />
        </Col>
        <Col lg={8}>
          <RegionalDistricts
            regions={regions}
            selectedRegion={parsedRegion}
            ref={register}
            defaultValue={initialValues.regionalDistrict}
            isInvalid={errors.regionalDistrict}
          />
        </Col>
      </Form.Row>
      <Form.Row>
        <Col lg={4}>
          <CustomDatePicker
            id="expiryDate"
            label="Expiry Date"
            notifyOnChange={handleFieldChange("expiryDate")}
            defaultValue={initialValues.expiryDate}
          />
        </Col>
        <Col lg={8}>
          <LicenceStatuses
            ref={register({ required: true })}
            isInvalid={errors.licenceStatus}
          />
        </Col>
      </Form.Row>
      <Form.Row>
        <Col lg={4}>
          <Form.Group controlId="paymentReceived">
            <CustomCheckBox
              id="paymentReceived"
              label="Payment Received"
              ref={register}
            />
          </Form.Group>
        </Col>
        <Col lg={4}>
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
                  defaultValue={initialValues.feePaidAmount}
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
        <Col lg={4}>
          <Form.Group controlId="actionRequired">
            <CustomCheckBox
              id="actionRequired"
              label="Action Required"
              ref={register}
            />
          </Form.Group>
        </Col>
        <Col lg={4}>
          <Form.Group controlId="printLicence">
            <CustomCheckBox
              id="printLicence"
              label="Print Licence"
              ref={register}
            />
          </Form.Group>
        </Col>
        <Col lg={4}>
          <Form.Group controlId="renewalNotice">
            <CustomCheckBox
              id="renewalNotice"
              label="Renewal Notice"
              ref={register}
            />
          </Form.Group>
        </Col>
      </Form.Row>
    </>
  );
}

LicenceDetailsEdit.propTypes = {
  form: PropTypes.object.isRequired,
  initialValues: PropTypes.object.isRequired,
};
