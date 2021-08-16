import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import NumberFormat from "react-number-format";
import { Controller } from "react-hook-form";
import { Button, Form, Col, InputGroup } from "react-bootstrap";

import {
  LICENCE_MODE,
  ADDRESS_TYPES,
  REQUEST_STATUS,
} from "../../utilities/constants";
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
import { formatIrmaNumber } from "./irmaNumberUtility";

import { ADDRESS } from "../../modals/AddressModal";
import { PHONE } from "../../modals/PhoneNumberModal";

import { openModal } from "../../app/appSlice";

import Species from "../lookups/Species";

import {
  LICENCE_TYPE_ID_GAME_FARM,
  LICENCE_TYPE_ID_FUR_FARM,
} from "./constants";

import { selectLicenceSpecies } from "../lookups/licenceSpeciesSlice";

export default function LicenceDetailsEdit({
  form,
  initialValues,
  licence,
  licenceTypeId,
  mode,
}) {
  const { watch, setValue, register, errors, control } = form;
  const dispatch = useDispatch();
  const regions = useSelector(selectRegions);

  const watchAddressKey = watch("selectedAddress", 0);
  const watchPhoneKey = watch("selectedPhoneNumber", 0);

  const licenceSpecies = useSelector(selectLicenceSpecies);

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
        ...address,
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
    const update = addresses;
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
    const update = phoneNumbers;
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

  const watchLicenceType = parseAsInt(watch("licenceType", licenceTypeId));

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

  let speciesDropdown = null;
  if (
    licenceSpecies.status === REQUEST_STATUS.FULFILLED &&
    (watchLicenceType === LICENCE_TYPE_ID_GAME_FARM ||
      watchLicenceType === LICENCE_TYPE_ID_FUR_FARM) &&
    (mode === LICENCE_MODE.CREATE ||
      (mode === LICENCE_MODE.EDIT && licence.speciesCodeId === null))
  ) {
    const filteredSpecies = licenceSpecies.data.species.filter(
      (x) => x.licenceTypeId === watchLicenceType
    );

    const filter = { data: {} };
    filter.data.species = filteredSpecies;
    filter.status = licenceSpecies.status;

    speciesDropdown = (
      <Form.Row className="mt-3">
        <Col lg={4}>
          <Form.Label>Species Type</Form.Label>
          <Species
            species={filter}
            name="speciesCodeId"
            defaultValue={licenceSpecies.data.species[0].id}
            ref={register({
              required: true,
            })}
          />
        </Col>
      </Form.Row>
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
              <Controller
                as={NumberFormat}
                name="irmaNumber"
                control={control}
                defaultValue={formatIrmaNumber(initialValues.irmaNumber)}
                format="##-###"
                mask="_"
                customInput={Form.Control}
                isInvalid={errors.irmaNumber}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid IRMA number.
              </Form.Control.Feedback>
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
                    {x.addressType} ({x.addressLine1}, {x.city})
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
      {speciesDropdown}
      {config.replacePaymentReceivedWithHiveFields ? (
        <Form.Row className="mt-3">
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
    </>
  );
}

LicenceDetailsEdit.propTypes = {
  form: PropTypes.object.isRequired,
  initialValues: PropTypes.object.isRequired,
  licence: PropTypes.object,
  licenceTypeId: PropTypes.number,
  mode: PropTypes.string.isRequired,
};

LicenceDetailsEdit.defaultProps = {
  licence: undefined,
  licenceTypeId: undefined,
};
