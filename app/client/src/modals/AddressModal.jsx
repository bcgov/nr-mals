/* eslint-disable */
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Button, Modal, Form, Col } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import NumberFormat from "react-number-format";

import { formatPhoneNumber } from "../utilities/formatting";
import { parseAsInt } from "../utilities/parsing";
import CustomCheckBox from "../components/CustomCheckBox";

import Cities from "../features/lookups/Cities";

import { selectCities } from "../features/lookups/citiesSlice";

import {
  ADDRESS_TYPES,
  COUNTRIES,
  COUNTRIES_MAP,
} from "../utilities/constants";

export const ADDRESS = "ADDRESS_MODAL";

export default function AddressModal({
  address,
  primaryAddress,
  existingTypes,
  closeModal,
  submit,
}) {
  const cities = useSelector(selectCities);

  const onSubmit = (data) => {
    submit({
      key: parseAsInt(data.addressKey),
      id: data.id === undefined ? -1 : data.id,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      addressType: data.addressType,
      city: data.city,
      country: data.country,
      phoneFax: data.phoneFax,
      postalCode: data.postalCode.replace(" ", ""),
      printToCertificate: data.printToCertificate,
      province: data.province,
    });
  };

  const populateFromPrimary = () => {
    setValue("addressLine1", primaryAddress.addressLine1);
    setValue("addressLine2", primaryAddress.addressLine2);
    setValue("city", primaryAddress.city);
    setValue("province", primaryAddress.province);
    setValue("postalCode", primaryAddress.postalCode);
    setValue("country", primaryAddress.country);
  };

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, handleSubmit, setValue, errors, watch } = form;

  const addressTypes = [
    { value: ADDRESS_TYPES.PRIMARY, description: "Primary Address" },
    { value: ADDRESS_TYPES.MAILING, description: "Mailing Address" },
  ];

  const addressOptions = addressTypes.filter(
    (x) => !existingTypes.includes(x.value) || x.value === address.addressType
  );

  const selectedCountry = watch("country", COUNTRIES.CANADA);
  const selectedProvince = watch("province", address.province ?? "BC");

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Form.Control
        hidden
        type="number"
        id="addressKey"
        name="addressKey"
        defaultValue={address.key}
        ref={register}
      />
      <Modal.Header closeButton>
        <Modal.Title>
          {address.addressLine1 ? "Edit an Address" : "Add an Address"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Row>
          <Col>
            <span className="float-right">
              <Button
                variant="secondary"
                disabled={primaryAddress === null}
                onClick={populateFromPrimary}
              >
                Populate from Primary Address
              </Button>
            </span>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.Group controlId="addressLine1">
              <Form.Label>Address (Line 1)</Form.Label>
              <Form.Control
                type="text"
                name="addressLine1"
                defaultValue={address.addressLine1 ?? null}
                ref={register({
                  required: true,
                })}
                isInvalid={errors.addressLine1}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid address line.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col>
            <Form.Group controlId="addressLine2">
              <Form.Label>Address (Line 2)</Form.Label>
              <Form.Control
                type="text"
                name="addressLine2"
                defaultValue={address.addressLine2 ?? null}
                ref={register}
              />
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col lg={4}>
            <Form.Group controlId="city">
              {selectedProvince !== "BC" ? (
                <>
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    defaultValue={address.city ?? null}
                    ref={register({
                      required: true,
                    })}
                    isInvalid={errors.city}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a city.
                  </Form.Control.Feedback>
                </>
              ) : (
                <Cities
                  cities={cities}
                  ref={register({ required: true })}
                  defaultValue={address.city ?? "BC"}
                  isInvalid={errors.city}
                />
              )}
            </Form.Group>
          </Col>
          <Col lg={2}>
            <Form.Group controlId="province">
              {selectedCountry === COUNTRIES.CANADA ? (
                <>
                  <Form.Label>Province</Form.Label>
                  <Form.Control
                    as="select"
                    name="province"
                    ref={register}
                    defaultValue={address.province ?? "BC"}
                  >
                    <option value="AB">AB</option>
                    <option value="BC">BC</option>
                    <option value="MB">MB</option>
                    <option value="NB">NB</option>
                    <option value="NL">NL</option>
                    <option value="NT">NT</option>
                    <option value="NS">NS</option>
                    <option value="NU">NU</option>
                    <option value="ON">ON</option>
                    <option value="PE">PE</option>
                    <option value="QC">QC</option>
                    <option value="SK">SK</option>
                    <option value="YT">YT</option>
                  </Form.Control>
                </>
              ) : (
                <>
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    name="province"
                    defaultValue={address.province ?? null}
                    ref={register}
                    maxLength={4}
                  />
                </>
              )}
            </Form.Group>
          </Col>
          <Col lg={2}>
            <Form.Group controlId="postalCode">
              <Form.Label>
                {selectedCountry === COUNTRIES.CANADA
                  ? "Postal Code"
                  : "Zip Code"}
              </Form.Label>
              <Form.Control
                type="text"
                name="postalCode"
                defaultValue={address.postalCode ?? null}
                ref={register}
                maxLength={7}
              />
            </Form.Group>
          </Col>
          <Col lg={4}>
            <Form.Group controlId="country">
              <Form.Label>Country</Form.Label>
              <Form.Control
                as="select"
                name="country"
                ref={register}
                defaultValue={address.country ?? COUNTRIES.CANADA}
              >
                {COUNTRIES_MAP.map((x) => {
                  return (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  );
                })}
              </Form.Control>
            </Form.Group>
          </Col>
        </Form.Row>
        <Form.Row>
          <Col lg={4}>
            <Form.Group controlId="addressType">
              <Form.Label>Address Type</Form.Label>
              <Form.Control
                as="select"
                name="addressType"
                ref={register}
                defaultValue={address.addressType ?? ADDRESS_TYPES.PRIMARY}
                custom
              >
                {addressOptions.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.description}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col />
        </Form.Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Modal.Footer>
    </Form>
  );
}

AddressModal.propTypes = {
  address: PropTypes.object.isRequired,
  primaryAddress: PropTypes.object,
  existingTypes: PropTypes.array,
  closeModal: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
};

AddressModal.defaultProps = {
  primaryAddress: null,
  existingTypes: [],
};
