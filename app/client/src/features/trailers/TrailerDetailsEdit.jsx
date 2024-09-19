import React from "react";
import PropTypes from "prop-types";
import { Form, Row, Col } from "react-bootstrap";
import { Controller } from "react-hook-form";
import { PatternFormat } from "react-number-format";

import SectionHeading from "../../components/SectionHeading";

import { formatPhoneNumber } from "../../utilities/formatting";
import LicenceStatuses from "../lookups/LicenceStatuses";

export default function TrailerDetailsEdit({ form, initialValues }) {
  const {
    watch,
    setValue,
    register,
    formState: { errors },
  } = form;

  return (
    <>
      <Row className="mt-3">
        <Col lg={4}>
          <LicenceStatuses
            {...register("trailerActiveFlag", { required: true })}
            isInvalid={errors.trailerActiveFlag}
            defaultValue={initialValues.trailerActiveFlag}
          />
        </Col>
        <Col lg={4}>
          <Form.Group controlId="dateIssued">
            <Form.Label>Date Issued</Form.Label>
            <Form.Control
              type="text"
              name="dateIssued"
              defaultValue={initialValues.dateIssued}
              {...register("dateIssued")}
            />
          </Form.Group>
        </Col>
        <Col lg={4}>
          <Form.Group controlId="trailerNo">
            <Form.Label>Trailer #</Form.Label>
            <Form.Control
              type="text"
              name="trailerNo"
              defaultValue={initialValues.trailerNo}
              {...register("trailerNo")}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={4}>
          <Form.Group controlId="division">
            <Form.Label>Division</Form.Label>
            <Form.Control
              type="text"
              name="division"
              defaultValue={initialValues.division}
              {...register("division")}
            />
          </Form.Group>
        </Col>
        <Col lg={4}>
          <Form.Group controlId="serialNo">
            <Form.Label>Serial No / VIN</Form.Label>
            <Form.Control
              type="text"
              name="serialNo"
              defaultValue={initialValues.serialNo}
              {...register("serialNo")}
            />
          </Form.Group>
        </Col>
        <Col lg={4}>
          <Form.Group controlId="licencePlateNo">
            <Form.Label>Licence Plate #</Form.Label>
            <Form.Control
              type="text"
              name="licencePlateNo"
              defaultValue={initialValues.licencePlateNo}
              {...register("licencePlateNo")}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={4}>
          <Form.Group controlId="year">
            <Form.Label>Year</Form.Label>
            <Form.Control
              type="text"
              name="year"
              defaultValue={initialValues.year}
              {...register("year")}
            />
          </Form.Group>
        </Col>
        <Col lg={4}>
          <Form.Group controlId="make">
            <Form.Label>Make</Form.Label>
            <Form.Control
              type="text"
              name="make"
              defaultValue={initialValues.make}
              {...register("make")}
            />
          </Form.Group>
        </Col>
        <Col lg={4}>
          <Form.Group controlId="trailerType">
            <Form.Label>Trailer Type</Form.Label>
            <Form.Control
              type="text"
              name="trailerType"
              defaultValue={initialValues.trailerType}
              {...register("trailerType")}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={4}>
          <Form.Group controlId="capacity">
            <Form.Label>Capacity</Form.Label>
            <Form.Control
              type="text"
              name="capacity"
              defaultValue={initialValues.capacity}
              {...register("capacity")}
            />
          </Form.Group>
        </Col>
        <Col lg={4}>
          <Form.Group controlId="compartments">
            <Form.Label>Compartments</Form.Label>
            <Form.Control
              type="text"
              name="compartments"
              defaultValue={initialValues.compartments}
              {...register("compartments")}
            />
          </Form.Group>
        </Col>
        <Col lg={4}></Col>
      </Row>
      {/* <SectionHeading>Site Contact Details</SectionHeading>
      <Row className="mt-3">
        <Col lg={4}>
          <Form.Group controlId="firstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              defaultValue={initialValues.firstName}
              {...register("firstName")}
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
              {...register("lastName")}
            />
          </Form.Group>
        </Col>
        <Col lg={4}>
          <Form.Group controlId="primaryPhone">
            <Form.Label>Primary Number</Form.Label>
            <Controller
              render={({ field: { onChange } }) => (
                <>
                  <PatternFormat
                    customInput={Form.Control}
                    format="(###) ###-####"
                    mask="_"
                    defaultValue={initialValues.primaryPhone ?? null}
                    onValueChange={(v) => {
                      onChange(v.formattedValue);
                    }}
                    isInvalid={errors && errors.primaryPhone}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid phone number.
                  </Form.Control.Feedback>
                </>
              )}
              name="primaryPhone"
              control={form.control}
              defaultValue={initialValues.primaryPhone ?? null}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={4}>
          <Form.Group controlId="secondaryPhone">
            <Form.Label>Secondary Number</Form.Label>
            <Controller
              render={({ field: { onChange } }) => (
                <>
                  <PatternFormat
                    customInput={Form.Control}
                    format="(###) ###-####"
                    mask="_"
                    defaultValue={formatPhoneNumber(
                      initialValues.secondaryPhone
                    )}
                    onValueChange={(v) => {
                      onChange(v.formattedValue);
                    }}
                    isInvalid={errors && errors.secondaryPhone}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid phone number.
                  </Form.Control.Feedback>
                </>
              )}
              name="secondaryPhone"
              control={form.control}
              defaultValue={formatPhoneNumber(initialValues.secondaryPhone)}
            />
          </Form.Group>
        </Col>
        <Col lg={4}>
          <Form.Group controlId="emailAddress">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="text"
              name="emailAddress"
              defaultValue={initialValues.emailAddress}
              {...register("emailAddress")}
            />
          </Form.Group>
        </Col>
      </Row> */}
    </>
  );
}

TrailerDetailsEdit.propTypes = {
  form: PropTypes.object.isRequired,
  initialValues: PropTypes.object.isRequired,
  licence: PropTypes.object,
  mode: PropTypes.string.isRequired,
};
