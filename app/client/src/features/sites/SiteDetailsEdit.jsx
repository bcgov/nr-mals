/* eslint-disable */
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { Button, Form, Row, Col, InputGroup } from "react-bootstrap";
import { Controller } from "react-hook-form";
import NumberFormat from "react-number-format";

import { selectRegions } from "../lookups/regionsSlice";

import LicenceStatuses from "../lookups/LicenceStatuses";
import Regions from "../lookups/Regions";
import RegionalDistricts from "../lookups/RegionalDistricts";
import SectionHeading from "../../components/SectionHeading";

import { parseAsInt } from "../../utilities/parsing";

import Cities from "../../features/lookups/Cities";

import { selectCities } from "../../features/lookups/citiesSlice";

import {
  LICENCE_TYPE_ID_APIARY,
  LICENCE_TYPE_ID_GAME_FARM,
} from "../licences/constants";

import {
  ADDRESS_TYPES,
  COUNTRIES,
  COUNTRIES_MAP,
} from "../../utilities/constants";

export default function SiteDetailsEdit({
  form,
  initialValues,
  licence,
  mode,
}) {
  const { watch, setValue, register, errors } = form;
  const dispatch = useDispatch();
  const regions = useSelector(selectRegions);

  const cities = useSelector(selectCities);

  const watchRegion = watch("region", null);
  const parsedRegion = parseAsInt(watchRegion);

  const licencePrimaryAddress = licence.addresses.find(
    (x) => x.addressType === "Primary"
  );

  const selectedCountry = watch("country", COUNTRIES.CANADA);
  const selectedProvince = watch("province", "BC");

  const populateFromPrimary = () => {
    setValue("addressLine1", licencePrimaryAddress.addressLine1);
    setValue("addressLine2", licencePrimaryAddress.addressLine2);
    setValue("city", licencePrimaryAddress.city);
    setValue("province", licencePrimaryAddress.province);
    setValue("postalCode", licencePrimaryAddress.postalCode);
    setValue("country", licencePrimaryAddress.country);
    setValue("region", licence.regionId);
    setValue("regionalDistrict", licence.regionalDistrictId);
  };

  const resetAddress = () => {
    setValue("addressLine1", null);
    setValue("addressLine2", null);
    setValue("city", null);
    setValue("province", null);
    setValue("postalCode", null);
    setValue("country", null);
    setValue("region", null);
    setValue("regionalDistrict", null);
  };

  console.log(initialValues);

  return (
    <>
      <Row className="mt-3">
        <Col lg={4}>
          <LicenceStatuses
            ref={register({ required: true })}
            isInvalid={errors.licenceStatus}
            defaultValue={initialValues.status}
          />
        </Col>
        <Col lg={4}>
          <Regions
            regions={regions}
            ref={register}
            defaultValue={initialValues.region}
            isInvalid={errors.region}
          />
        </Col>
        <Col lg={4}>
          <RegionalDistricts
            regions={regions}
            selectedRegion={parsedRegion}
            ref={register}
            defaultValue={initialValues.district}
            isInvalid={errors.regionalDistrict}
          />
        </Col>
      </Row>
      {licence.licenceTypeId === LICENCE_TYPE_ID_APIARY ? (
        <Row className="mt-3">
          <Col lg={4}>
            <Form.Group controlId="hiveCount">
              <Form.Label>Number of Hives</Form.Label>
              <Form.Control
                type="number"
                name="hiveCount"
                defaultValue={initialValues.hiveCount}
                ref={register}
              />
            </Form.Group>
          </Col>
        </Row>
      ) : null}
      <Row className="mt-3">
        <Col lg={4}>
          <Form.Group controlId="addressLine1">
            <Form.Label>Address Line 1</Form.Label>
            <Form.Control
              type="text"
              name="addressLine1"
              defaultValue={initialValues.addressLine1}
              ref={register}
              isInvalid={errors.addressLine1}
            />
            <Form.Control.Feedback type="invalid">
              Please enter a valid address line.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={4}>
          <Form.Group controlId="addressLine2">
            <Form.Label>Address Line 2</Form.Label>
            <Form.Control
              type="text"
              name="addressLine2"
              defaultValue={initialValues.addressLine2}
              ref={register}
            />
          </Form.Group>
        </Col>
        <Col lg={4} />
        <Col lg={4}>
          <Form.Group controlId="city">
            {selectedProvince !== "BC" ? (
              <>
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  defaultValue={initialValues.city ?? null}
                  ref={register}
                  isInvalid={errors.city}
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a city.
                </Form.Control.Feedback>
              </>
            ) : (
              <Cities
                cities={cities}
                ref={register}
                defaultValue={initialValues.city ?? "BC"}
                isInvalid={errors.city}
              />
            )}
          </Form.Group>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={2}>
          <Form.Group controlId="province">
            {selectedCountry === COUNTRIES.CANADA ? (
              <>
                <Form.Label>Province</Form.Label>
                <Form.Control
                  as="select"
                  name="province"
                  ref={register}
                  defaultValue={initialValues.province ?? "BC"}
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
                  defaultValue={initialValues.province ?? null}
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
              defaultValue={initialValues.postalCode ?? null}
              ref={register}
              maxLength={7}
            />
          </Form.Group>
        </Col>
        <Col lg={2}>
          <Form.Group controlId="country">
            <Form.Label>Country</Form.Label>
            <Form.Control
              as="select"
              name="country"
              ref={register}
              defaultValue={initialValues.country ?? COUNTRIES.CANADA}
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
        <Col lg={2} />
        <Col lg={2}>
          <Form.Group controlId="latitude">
            <Form.Label>Latitude</Form.Label>
            <Form.Control
              type="text"
              name="latitude"
              defaultValue={initialValues.latitude}
              ref={register}
            />
          </Form.Group>
        </Col>
        <Col lg={2}>
          <Form.Group controlId="longitude">
            <Form.Label>Longitude</Form.Label>
            <Form.Control
              type="text"
              name="longitude"
              defaultValue={initialValues.longitude}
              ref={register}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col lg={5}>
          <Button
            variant="secondary"
            disabled={licencePrimaryAddress === undefined}
            onClick={populateFromPrimary}
          >
            Populate address from Licence Primary Address
          </Button>
        </Col>
        <Col lg={7}>
          <span className="float-right">
            <Button variant="secondary" onClick={resetAddress}>
              Remove Site Address
            </Button>
          </span>
        </Col>
      </Row>
      <SectionHeading>Site Contact Details</SectionHeading>
      <Row className="mt-3">
        <Col lg={4}>
          <Form.Group controlId="firstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              defaultValue={initialValues.firstName}
              ref={register}
            />
          </Form.Group>
        </Col>
        <Col lg={4}>
          <Form.Group controlId="lastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              defaultValue={initialValues.lastName}
              ref={register}
            />
          </Form.Group>
        </Col>
        <Col lg={4}>
          <Form.Group controlId="primaryPhone">
            <Form.Label>Primary Number</Form.Label>
            <Controller
              as={NumberFormat}
              name="primaryPhone"
              control={form.control}
              defaultValue={initialValues.primaryPhone ?? null}
              format="(###) ###-####"
              mask="_"
              customInput={Form.Control}
              isInvalid={errors.number}
            />
            <Form.Control.Feedback type="invalid">
              Please enter a valid phone number.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={4}>
          <Form.Group controlId="secondaryPhone">
            <Form.Label>Secondary Number</Form.Label>
            <Controller
              as={NumberFormat}
              name="secondaryPhone"
              control={form.control}
              defaultValue={initialValues.secondaryPhone ?? null}
              format="(###) ###-####"
              mask="_"
              customInput={Form.Control}
              isInvalid={errors.number}
            />
            <Form.Control.Feedback type="invalid">
              Please enter a valid phone number.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col lg={4}>
          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="text"
              name="email"
              defaultValue={initialValues.email}
              ref={register}
            />
          </Form.Group>
        </Col>
      </Row>
      {licence.licenceTypeId === LICENCE_TYPE_ID_GAME_FARM ? (
        <Row className="mt-3">
          <Col>
            <Form.Group controlId="legalDescription">
              <Form.Label>Legal Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                name="legalDescriptionText"
                ref={register}
                maxLength={2000}
                className="mb-1"
              />
            </Form.Group>
          </Col>
        </Row>
      ) : null}
    </>
  );
}

SiteDetailsEdit.propTypes = {
  form: PropTypes.object.isRequired,
  initialValues: PropTypes.object.isRequired,
  licence: PropTypes.object,
  mode: PropTypes.string.isRequired,
};
