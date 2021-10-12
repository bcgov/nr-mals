import React from "react";
import PropTypes from "prop-types";
import { Form, Row, Col } from "react-bootstrap";

import CustomDatePicker from "../../components/CustomDatePicker";
import SectionHeading from "../../components/SectionHeading";

export default function ApiaryInspectionDetailsEdit({
  form,
  initialValues,
  site,
}) {
  const { setValue, register, errors } = form;

  const handleFieldChange = (field) => {
    return (value) => {
      setValue(field, value);
    };
  };

  return (
    <>
      <Row className="mt-3">
        <Col lg={3}>
          <Form.Group controlId="siteId">
            <Form.Label>Apiary Site ID</Form.Label>
            <Form.Control
              type="text"
              name="siteId"
              defaultValue={site.apiarySiteId}
              readOnly
            />
          </Form.Group>
        </Col>
        <Col lg={3}>
          <CustomDatePicker
            id="inspectionDate"
            label="Date Inspected"
            notifyOnChange={handleFieldChange("inspectionDate")}
            defaultValue={initialValues.inspectionDate}
            isInvalid={errors.inspectionDate}
          />
        </Col>
        <Col lg={3}>
          <Form.Group controlId="inspectorId">
            <Form.Label>Inspector ID</Form.Label>
            <Form.Control
              type="text"
              name="inspectorId"
              defaultValue={initialValues.inspectorId}
              ref={register}
              maxLength={10}
            />
          </Form.Group>
        </Col>
        <Col lg={3}>
          <Form.Group controlId="inspectorName">
            <Form.Label>Inspector Name</Form.Label>
            <Form.Control
              type="text"
              name="inspectorName"
              defaultValue={initialValues.inspectorName}
              ref={register}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col lg={3}>
          <Form.Group controlId="liveColonies">
            <Form.Label>Live Colonies in Yard</Form.Label>
            <Form.Control
              type="number"
              name="liveColonies"
              defaultValue={initialValues.liveColonies}
              ref={register}
            />
          </Form.Group>
        </Col>
        <Col lg={3}>
          <Form.Group controlId="coloniesTested">
            <Form.Label>Number of Colonies Tested</Form.Label>
            <Form.Control
              type="number"
              name="coloniesTested"
              defaultValue={initialValues.coloniesTested}
              ref={register}
            />
          </Form.Group>
        </Col>
        <Col lg={2}>
          <Form.Group controlId="broodTested">
            <Form.Label>Brood</Form.Label>
            <Form.Control
              type="number"
              name="broodTested"
              defaultValue={initialValues.broodTested}
              ref={register}
            />
          </Form.Group>
        </Col>
        <Col lg={2}>
          <Form.Group controlId="varroaTested">
            <Form.Label>Varroa</Form.Label>
            <Form.Control
              type="number"
              name="varroaTested"
              defaultValue={initialValues.varroaTested}
              ref={register}
            />
          </Form.Group>
        </Col>
        <Col lg={2}>
          <Form.Group controlId="smallHiveBeetleTested">
            <Form.Label>SHB</Form.Label>
            <Form.Control
              type="number"
              name="smallHiveBeetleTested"
              defaultValue={initialValues.smallHiveBeetleTested}
              ref={register}
            />
          </Form.Group>
        </Col>
      </Row>
      <section>
        <SectionHeading>Test Results</SectionHeading>
      </section>
      <Row>
        <Col lg={6}>
          <Row>
            <Col lg={4}>
              <Form.Group controlId="americanFoulbroodResult">
                <Form.Label>AFB</Form.Label>
                <Form.Control
                  type="number"
                  name="americanFoulbroodResult"
                  defaultValue={initialValues.americanFoulbroodResult}
                  ref={register}
                />
              </Form.Group>
            </Col>
            <Col lg={4}>
              <Form.Group controlId="europeanFoulbroodResult">
                <Form.Label>EFB</Form.Label>
                <Form.Control
                  type="number"
                  name="europeanFoulbroodResult"
                  defaultValue={initialValues.europeanFoulbroodResult}
                  ref={register}
                />
              </Form.Group>
            </Col>
            <Col lg={4}>
              <Form.Group controlId="smallHiveBeetleResult">
                <Form.Label>SHB</Form.Label>
                <Form.Control
                  type="number"
                  name="smallHiveBeetleResult"
                  defaultValue={initialValues.smallHiveBeetleResult}
                  ref={register}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col lg={4}>
              <Form.Group controlId="chalkbroodResult">
                <Form.Label>Chalkbrood</Form.Label>
                <Form.Control
                  type="number"
                  name="chalkbroodResult"
                  defaultValue={initialValues.chalkbroodResult}
                  ref={register}
                />
              </Form.Group>
            </Col>
            <Col lg={4}>
              <Form.Group controlId="sacbroodResult">
                <Form.Label>Sacbrood</Form.Label>
                <Form.Control
                  type="number"
                  name="sacbroodResult"
                  defaultValue={initialValues.sacbroodResult}
                  ref={register}
                />
              </Form.Group>
            </Col>
            <Col lg={4}>
              <Form.Group controlId="nosemaResult">
                <Form.Label>Nosema</Form.Label>
                <Form.Control
                  type="number"
                  name="nosemaResult"
                  defaultValue={initialValues.nosemaResult}
                  ref={register}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <Form.Group controlId="varroaMiteResult">
                <Form.Label>Varroa Mites</Form.Label>
                <Form.Control
                  type="number"
                  name="varroaMiteResult"
                  defaultValue={initialValues.varroaMiteResult}
                  ref={register}
                />
              </Form.Group>
            </Col>
            <Col lg={6}>
              <Form.Group controlId="varroaMiteResultPercent">
                <Form.Label>Varroa Mites (%)</Form.Label>
                <Form.Control
                  type="number"
                  name="varroaMiteResultPercent"
                  defaultValue={initialValues.varroaMiteResultPercent}
                  ref={register}
                />
              </Form.Group>
            </Col>
          </Row>
        </Col>
        <Col lg={6}>
          <Form.Group controlId="otherResultDescription">
            <Form.Label>Other</Form.Label>
            <Form.Control
              as="textarea"
              rows={8}
              name="otherResultDescription"
              defaultValue={initialValues.otherResultDescription}
              ref={register}
              maxLength={240}
              className="mb-1"
            />
          </Form.Group>
        </Col>
      </Row>
      <SectionHeading>Equipment Inspected</SectionHeading>
      <Row>
        <Col lg={3}>
          <Form.Group controlId="supersInspected">
            <Form.Label>Supers Inspected</Form.Label>
            <Form.Control
              type="number"
              name="supersInspected"
              defaultValue={initialValues.supersInspected}
              ref={register}
            />
          </Form.Group>
        </Col>
        <Col />
        <Col lg={3}>
          <Form.Group controlId="supersDestroyed">
            <Form.Label>Supers Destroyed</Form.Label>
            <Form.Control
              type="number"
              name="supersDestroyed"
              defaultValue={initialValues.supersDestroyed}
              ref={register}
            />
          </Form.Group>
        </Col>
        <Col />
      </Row>
      <SectionHeading>Comments</SectionHeading>
      <Row>
        <Col lg={12}>
          <Form.Control
            as="textarea"
            rows={6}
            maxLength={2000}
            name="inspectionComment"
            defaultValue={initialValues.inspectionComment}
            ref={register}
            className="mb-1"
          />
        </Col>
      </Row>
    </>
  );
}

ApiaryInspectionDetailsEdit.propTypes = {
  form: PropTypes.object.isRequired,
  initialValues: PropTypes.object.isRequired,
  site: PropTypes.object.isRequired,
};
