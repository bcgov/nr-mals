import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Form, Col, InputGroup } from "react-bootstrap";

import { LICENCE_MODE } from "../../utilities/constants";
import { parseAsInt } from "../../utilities/parsing";
import { formatDate } from "../../utilities/formatting.ts";

import CustomCheckBox from "../../components/CustomCheckBox";
import CustomDatePicker from "../../components/CustomDatePicker";
import VerticalField from "../../components/VerticalField";

import { selectRegions } from "../lookups/regionsSlice";

import LicenceStatuses from "../lookups/LicenceStatuses";
import Regions from "../lookups/Regions";
import RegionalDistricts from "../lookups/RegionalDistricts";

import { getLicenceTypeConfiguration } from "./licenceTypeUtility";

export default function LicenceDetailsEdit({
  form,
  initialValues,
  licenceTypeId,
  mode,
}) {
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

  const config = getLicenceTypeConfiguration(licenceTypeId);

  useEffect(() => {
    if (config.replaceExpiryDateWithIrmaNumber) {
      setValue("expiryDate", undefined);
      setValue("irmaNumber", null);
    } else {
      setValue("irmaNumber", undefined);
      setValue("expiryDate", null);
    }
  }, [licenceTypeId]);

  let applicationDate = (
    <VerticalField
      label="Application Date"
      value={formatDate(initialValues.applicationDate)}
    />
  );
  if (mode === LICENCE_MODE.CREATE) {
    applicationDate = (
      <CustomDatePicker
        id="applicationDate"
        label="Application Date"
        notifyOnChange={handleFieldChange("applicationDate")}
        defaultValue={initialValues.applicationDate}
      />
    );
  }

  return (
    <>
      <Form.Row>
        <Col lg={4}>{applicationDate}</Col>
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
          {config.replaceExpiryDateWithIrmaNumber ? (
            <Form.Group controlId="irmaNumber">
              <Form.Label>IRMA Number</Form.Label>
              <Form.Control
                type="text"
                name="irmaNumber"
                defaultValue={initialValues.irmaNumber}
                ref={register}
              />
            </Form.Group>
          ) : (
            <CustomDatePicker
              id="expiryDate"
              label="Expiry Date"
              notifyOnChange={handleFieldChange("expiryDate")}
              defaultValue={initialValues.expiryDate}
            />
          )}
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
  licenceTypeId: PropTypes.number,
  mode: PropTypes.string.isRequired,
};

LicenceDetailsEdit.defaultProps = {
  licenceTypeId: undefined,
};
