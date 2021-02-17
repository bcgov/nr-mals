import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { Button, Form, Col, InputGroup } from "react-bootstrap";

import { LICENCE_MODE } from "../../utilities/constants";
import { parseAsInt } from "../../utilities/parsing";
import { formatDate, formatPhoneNumber } from "../../utilities/formatting.ts";

import CustomCheckBox from "../../components/CustomCheckBox";
import CustomDatePicker from "../../components/CustomDatePicker";
import VerticalField from "../../components/VerticalField";

import { selectRegions } from "../lookups/regionsSlice";

import LicenceStatuses from "../lookups/LicenceStatuses";
import Regions from "../lookups/Regions";
import RegionalDistricts from "../lookups/RegionalDistricts";

import { getLicenceTypeConfiguration } from "./licenceTypeUtility";

import { ADDRESS, AddressModal } from "../../modals/AddressModal";
import { PHONE, PhoneNumberModal } from "../../modals/PhoneNumberModal";

import { openModal } from "../../app/appSlice";

import { ADDRESS_TYPES, PHONE_NUMBER_TYPES } from "../../utilities/constants";

export default function LicenceDetailsEdit({
  form,
  initialValues,
  licenceTypeId,
  mode,
}) {
  const { watch, setValue, register, errors } = form;
  const dispatch = useDispatch();
  const regions = useSelector(selectRegions);

  const watchAddressKey = watch("selectedAddress", 0);
  const watchPhoneKey = watch("selectedPhoneNumber", 0);

  const [addresses, setAddresses] = useState([...initialValues.addresses]);
  const [phoneNumbers, setPhoneNumbers] = useState([
    ...initialValues.phoneNumbers,
  ]);

  const formatAddresses = (addressList) => {
    if (addressList === undefined) {
      return undefined;
    }

    return addressList.map((address) => {
      return {
        ...address
      };
    });
  };

  const formatPhoneNumbers = (phoneList) => {
    if (phoneList === undefined) {
      return undefined;
    }

    return phoneList.map((phone) => {
      return {
        ...phone,
        number: phone.number ? phone.number.replace(/\D/g, "") : null,
      };
    });
  };

  const addAddressCallback = (data) => {
    const formatted = formatAddresses([...addresses, data]);
    setValue("addresses", formatted);
    setAddresses(formatted);
  };

  const editAddressCallback = (data) => {
    let update = addresses;
    update[data.key] = data;
    const formatted = formatAddresses(update);
    setValue("addresses", formatted);
    setAddresses(formatted);
  };

  const addAddress = () => {
    const address = { key: addresses.length };
    const existingTypes = addresses.map((x) => {
      return x.addressType;
    });
    const primaryAddress = addresses.find(
      (x) => x.addressType === ADDRESS_TYPES.PRIMARY
    );
    dispatch(
      openModal(
        ADDRESS,
        addAddressCallback,
        { address, primaryAddress, existingTypes },
        "lg"
      )
    );
  };

  const editAddress = () => {
    // The watch doesnt seem to be updated when adding the initial entry to addresses
    // So manually set the key here
    let selectedKey = watchAddressKey;
    if (selectedKey.length === 0) {
      selectedKey = 0;
    }

    const address = addresses[selectedKey];
    const existingTypes = addresses.map((x) => {
      return x.addressType;
    });
    const primaryAddress = addresses.find(
      (x) => x.addressType === ADDRESS_TYPES.PRIMARY
    );
    dispatch(
      openModal(
        ADDRESS,
        editAddressCallback,
        { address, primaryAddress, existingTypes },
        "lg"
      )
    );
  };

  const addPhoneCallback = (data) => {
    const formatted = formatPhoneNumbers([...phoneNumbers, data]);
    setValue("phoneNumbers", formatted);
    setPhoneNumbers(formatted);
  };

  const editPhoneCallback = (data) => {
    let update = phoneNumbers;
    update[data.key] = data;
    const formatted = formatPhoneNumbers(update);
    setValue("phoneNumbers", formatted);
    setPhoneNumbers(formatted);
  };

  const addPhone = () => {
    const phone = { key: phoneNumbers.length };
    const existingTypes = phoneNumbers.map((x) => {
      return x.phoneNumberType;
    });
    dispatch(
      openModal(PHONE, addPhoneCallback, { phone, existingTypes }, "lg")
    );
  };

  const editPhone = () => {
    // The watch doesnt seem to be updated when adding the initial entry to phone numbers
    // So manually set the key here
    let selectedKey = watchPhoneKey;
    if (selectedKey.length === 0) {
      selectedKey = 0;
    }

    const phone = phoneNumbers[selectedKey];
    const existingTypes = phoneNumbers.map((x) => {
      return x.phoneNumberType;
    });
    dispatch(
      openModal(PHONE, editPhoneCallback, { phone, existingTypes }, "lg")
    );
  };

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

    if (config.replacePaymentReceivedWithHiveFields) {
      setValue("paymentReceived", undefined);
      setValue("feePaidAmount", undefined);
      setValue("totalHives", null);
      setValue("hivesPerApiary", null);
    } else {
      setValue("totalHives", undefined);
      setValue("hivesPerApiary", undefined);
      setValue("paymentReceived", false);
      setValue("feePaidAmount", null);
    }
  }, [
    licenceTypeId,
    setValue,
    config.replaceExpiryDateWithIrmaNumber,
    config.replacePaymentReceivedWithHiveFields,
  ]);

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
        <Col lg={6}>
          <Form.Row className="mb-2">
            <Col lg={9}>
              <Form.Label>Address</Form.Label>
            </Col>
            <Col lg={3}>
              <Button onClick={addAddress} disabled={addresses.length >= 2}>
                Add
              </Button>
            </Col>
          </Form.Row>

          <Form.Row>
            <Col lg={9}>
              <Form.Control
                as="select"
                name="selectedAddress"
                id="selectedAddress"
                ref={register}
                disabled={addresses.length === 0}
                custom
              >
                {addresses.map((x) => (
                  <option key={x.key} value={x.key}>
                    {x.addressType} ({x.addressLine1})
                  </option>
                ))}
              </Form.Control>
            </Col>
            <Col lg={3}>
              <Button onClick={editAddress} disabled={addresses.length === 0}>
                Edit
              </Button>
            </Col>
          </Form.Row>
        </Col>
        <Col>
          <Form.Row className="mb-2">
            <Col lg={9}>
              <Form.Label>Phone / Fax</Form.Label>
            </Col>
            <Col lg={3}>
              <Button onClick={addPhone} disabled={phoneNumbers.length >= 3}>
                Add
              </Button>
            </Col>
          </Form.Row>

          <Form.Row>
            <Col lg={9}>
              <Form.Control
                as="select"
                name="selectedPhoneNumber"
                id="selectedPhoneNumber"
                ref={register}
                disabled={phoneNumbers.length === 0}
                custom
              >
                {phoneNumbers.map((x) => (
                  <option key={x.key} value={x.key}>
                    {x.phoneNumberType} ({formatPhoneNumber(x.number)})
                  </option>
                ))}
              </Form.Control>
            </Col>
            <Col lg={3}>
              <Button onClick={editPhone} disabled={phoneNumbers.length === 0}>
                Edit
              </Button>
            </Col>
          </Form.Row>
        </Col>
      </Form.Row>
      {config.replacePaymentReceivedWithHiveFields ? (
        <Form.Row>
          <Col lg={4}>
            <Form.Group controlId="totalHives">
              <Form.Label>Total Hives</Form.Label>
              <Form.Control
                type="number"
                name="totalHives"
                defaultValue={initialValues.totalHives}
                ref={register}
              />
            </Form.Group>
          </Col>
          <Col lg={4}>
            <Form.Group controlId="hivesPerApiary">
              <Form.Label>Hives per Apiary</Form.Label>
              <Form.Control
                type="number"
                name="hivesPerApiary"
                defaultValue={initialValues.hivesPerApiary}
                ref={register}
              />
            </Form.Group>
          </Col>
        </Form.Row>
      ) : (
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
      )}
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
