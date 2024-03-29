import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { Controller } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { Row, Col, Form } from "react-bootstrap";

import { formatPhoneNumber } from "../../utilities/formatting.ts";

import CustomCheckBox from "../../components/CustomCheckBox";

// eslint-disable-next-line
export default function RegistrantEdit({ form, registrant, submitting }) {
  const {
    register,
    setValue,
    formState: { errors },
    control,
    clearErrors,
  } = form;
  const fieldName = `registrants.${registrant.key}`;
  const registrantErrors = errors.registrants
    ? errors.registrants[registrant.key]
    : undefined;

  const dispatch = useDispatch();

  useEffect(() => {
    setValue(
      `${fieldName}.companyNameOverride`,
      registrant.companyNameOverride !== undefined
        ? registrant.companyNameOverride
        : false
    );
  }, [dispatch]);

  return (
    <>
      <fieldset name={fieldName} key={fieldName}>
        <input
          type="hidden"
          id={`${fieldName}.status`}
          name={`${fieldName}.status`}
          value={registrant.status || ""}
          {...register(`${fieldName}.status`)}
        />
        <input
          type="hidden"
          id={`${fieldName}.id`}
          name={`${fieldName}.id`}
          value={registrant.id || ""}
          {...register(`${fieldName}.id`)}
        />
        <Row>
          <Col>
            <Form.Group controlId={`${fieldName}.firstName`}>
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name={`${fieldName}.firstName`}
                defaultValue={registrant.firstName}
                {...register(`${fieldName}.firstName`)}
                isInvalid={registrantErrors && registrantErrors.names}
                onBlur={() => clearErrors(`${fieldName}.names`)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId={`${fieldName}.lastName`}>
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name={`${fieldName}.lastName`}
                defaultValue={registrant.lastName}
                {...register(`${fieldName}.lastName`)}
                isInvalid={registrantErrors && registrantErrors.names}
                onBlur={() => clearErrors(`${fieldName}.names`)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId={`${fieldName}.officialTitle`}>
              <Form.Label>Official Title</Form.Label>
              <Form.Control
                type="text"
                name={`${fieldName}.officialTitle`}
                defaultValue={registrant.officialTitle}
                {...register(`${fieldName}.officialTitle`)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group controlId={`${fieldName}.companyName`}>
              <Form.Label>Company Name</Form.Label>
              <Form.Control
                type="text"
                name={`${fieldName}.companyName`}
                defaultValue={registrant.companyName}
                {...register(`${fieldName}.companyName`)}
                isInvalid={registrantErrors && registrantErrors.names}
                onBlur={() => clearErrors(`${fieldName}.names`)}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a company name or a first name and a last name.
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId={`${fieldName}.primaryPhone`}>
              <Form.Label>Primary Phone</Form.Label>
              <Controller
                render={({ field: { onChange } }) => (
                  <>
                    <PatternFormat
                      customInput={Form.Control}
                      format="(###) ###-####"
                      mask="_"
                      defaultValue={formatPhoneNumber(registrant.primaryPhone)}
                      onValueChange={(v) => {
                        onChange(v.formattedValue);
                      }}
                      isInvalid={
                        registrantErrors && registrantErrors.primaryPhone
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      Please enter a valid phone number.
                    </Form.Control.Feedback>
                  </>
                )}
                name={`${fieldName}.primaryPhone`}
                control={control}
                defaultValue={formatPhoneNumber(registrant.primaryPhone)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId={`${fieldName}.email`}>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="text"
                name={`${fieldName}.email`}
                defaultValue={registrant.email}
                {...register(`${fieldName}.email`)}
              />
            </Form.Group>
          </Col>
        </Row>
        {registrant.key === 0 ? (
          <Row>
            <Col lg={6}>
              <Form.Group controlId="companyNameOverride">
                <CustomCheckBox
                  id={`${fieldName}.companyNameOverride`}
                  label="Company Name to appear on License"
                  {...register(`${fieldName}.companyNameOverride`)}
                />
              </Form.Group>
            </Col>
          </Row>
        ) : null}
      </fieldset>
    </>
  );
}

RegistrantEdit.propTypes = {
  registrant: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  submitting: PropTypes.bool.isRequired,
};
