import React from "react";
import { useForm } from "react-hook-form";
import { Container, Form, Row, Col } from "react-bootstrap";

import PageHeading from "../../components/PageHeading";

import { REPORTS } from "../../utilities/constants";

import ReportActionRequired from "./ReportActionRequired";
import ReportApiaryHiveInspection from "./ReportApiaryHiveInspection";
import ReportProducersAnalysisRegion from "./ReportProducersAnalysisRegion";
import ReportProducersAnalysisCity from "./ReportProducersAnalysisCity";
import ReportProvincialFarmQuality from "./ReportProvincialFarmQuality";
import ReportLicenceTypeLocation from "./ReportLicenceTypeLocation";

export default function Reports() {
  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, watch } = form;

  const selectedConfig = watch("selectedConfig", null);

  let control = null;
  switch (selectedConfig) {
    case REPORTS.ACTION_REQUIRED:
      control = <ReportActionRequired />;
      break;
    case REPORTS.APIARY_INSPECTION:
      control = <ReportApiaryHiveInspection />;
      break;
    case REPORTS.PRODUCERS_ANALYSIS_REGION:
      control = <ReportProducersAnalysisRegion />;
      break;
    case REPORTS.PRODUCERS_ANALYSIS_CITY:
      control = <ReportProducersAnalysisCity />;
      break;
    case REPORTS.DAIRY_FARM_QUALITY:
      control = <ReportProvincialFarmQuality />;
      break;
    case REPORTS.LICENCE_LOCATION:
      control = <ReportLicenceTypeLocation />;
      break;
    default:
      break;
  }

  return (
    <>
      <PageHeading>Reports</PageHeading>
      <Container className="mt-3 mb-4">
        <Row>
          <Col sm={4}>
            <Form.Label>Select a Report</Form.Label>
            <Form.Control
              as="select"
              name="selectedConfig"
              ref={register}
              defaultValue={null}
            >
              <option value={null} />
              <option value={REPORTS.ACTION_REQUIRED}>Action Required</option>
              <option value={REPORTS.APIARY_INSPECTION}>
                Apiary Hive Inspection
              </option>
              <option value={REPORTS.PRODUCERS_ANALYSIS_REGION}>
                Producer&apos;s Analysis Report by Region
              </option>
              <option value={REPORTS.PRODUCERS_ANALYSIS_CITY}>
                Producer City &amp; Municipality
              </option>
              <option value={REPORTS.DAIRY_FARM_QUALITY}>
                Provincial Farm Quality
              </option>
              <option value={REPORTS.LICENCE_LOCATION}>Licence Location</option>
            </Form.Control>
          </Col>
        </Row>
        <div className="mt-3">{control}</div>
      </Container>
    </>
  );
}

Reports.propTypes = {};
