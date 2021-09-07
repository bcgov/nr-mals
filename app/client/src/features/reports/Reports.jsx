import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Container, Form, Row, Col } from "react-bootstrap";

import PageHeading from "../../components/PageHeading";

import { REPORTS, SYSTEM_ROLES } from "../../utilities/constants";

import ReportActionRequired from "./ReportActionRequired";
import ReportApiaryHiveInspection from "./ReportApiaryHiveInspection";
import ReportApiarySite from "./ReportApiarySite";
import ReportProducersAnalysisRegion from "./ReportProducersAnalysisRegion";
import ReportProducersAnalysisCity from "./ReportProducersAnalysisCity";
import ReportProvincialFarmQuality from "./ReportProvincialFarmQuality";
import ReportClientDetails from "./ReportClientDetails";
import ReportDairyClientDetails from "./ReportDairyClientDetails";
import ReportDairyThreshold from "./ReportDairyThreshold";
import ReportDairyTankRecheck from "./ReportDairyTankRecheck";
import ReportLicenceTypeLocation from "./ReportLicenceTypeLocation";
import ReportLicenceExpiry from "./ReportLicenceExpiry";

import { clearReportsJob } from "./reportsSlice";
import RenderOnRole from "../../components/RenderOnRole";

export default function Reports() {
  const dispatch = useDispatch();

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, watch } = form;

  const selectedConfig = watch("selectedConfig", null);

  useEffect(() => {
    dispatch(clearReportsJob());
  }, [selectedConfig]);

  let control = null;
  switch (selectedConfig) {
    case REPORTS.ACTION_REQUIRED:
      control = <ReportActionRequired />;
      break;
    case REPORTS.APIARY_INSPECTION:
      control = <ReportApiaryHiveInspection />;
      break;
    case REPORTS.APIARY_PRODUCER_REGION:
      control = <ReportProducersAnalysisRegion />;
      break;
    case REPORTS.APIARY_PRODUCER_CITY:
      control = <ReportProducersAnalysisCity />;
      break;
    case REPORTS.APIARY_SITE:
      control = <ReportApiarySite />;
      break;
    case REPORTS.CLIENT_DETAILS:
      control = <ReportClientDetails />;
      break;
    case REPORTS.DAIRY_FARM_DETAIL:
      control = <ReportDairyClientDetails />;
      break;
    case REPORTS.DAIRY_FARM_QUALITY:
      control = <ReportProvincialFarmQuality />;
      break;
    case REPORTS.DAIRY_FARM_TANK:
      control = <ReportDairyTankRecheck />;
      break;
    case REPORTS.DAIRY_TEST_THRESHOLD:
      control = <ReportDairyThreshold />;
      break;
    case REPORTS.LICENCE_LOCATION:
      control = <ReportLicenceTypeLocation />;
      break;
    case REPORTS.LICENCE_EXPIRY:
      control = <ReportLicenceExpiry />;
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
              {/* Reports to be ordered alphabetically */}
              <option value={null} />

              <RenderOnRole
                roles={[
                  SYSTEM_ROLES.READ_ONLY,
                  SYSTEM_ROLES.USER,
                  SYSTEM_ROLES.INSPECTOR,
                  SYSTEM_ROLES.SYSTEM_ADMIN,
                ]}
              >
                <option value={REPORTS.ACTION_REQUIRED}>Action Required</option>
              </RenderOnRole>

              <RenderOnRole
                roles={[
                  SYSTEM_ROLES.READ_ONLY,
                  SYSTEM_ROLES.USER,
                  SYSTEM_ROLES.INSPECTOR,
                  SYSTEM_ROLES.SYSTEM_ADMIN,
                ]}
              >
                <option value={REPORTS.APIARY_INSPECTION}>
                  Apiary Hive Inspection
                </option>
              </RenderOnRole>

              <RenderOnRole
                roles={[
                  SYSTEM_ROLES.READ_ONLY,
                  SYSTEM_ROLES.USER,
                  SYSTEM_ROLES.INSPECTOR,
                  SYSTEM_ROLES.SYSTEM_ADMIN,
                ]}
              >
                <option value={REPORTS.APIARY_SITE}>Apiary Site</option>
              </RenderOnRole>

              <RenderOnRole
                roles={[
                  SYSTEM_ROLES.READ_ONLY,
                  SYSTEM_ROLES.USER,
                  SYSTEM_ROLES.SYSTEM_ADMIN,
                ]}
              >
                <option value={REPORTS.CLIENT_DETAILS}>Client Details</option>
              </RenderOnRole>

              <RenderOnRole
                roles={[
                  SYSTEM_ROLES.READ_ONLY,
                  SYSTEM_ROLES.USER,
                  SYSTEM_ROLES.INSPECTOR,
                  SYSTEM_ROLES.SYSTEM_ADMIN,
                ]}
              >
                <option value={REPORTS.DAIRY_FARM_DETAIL}>
                  Dairy Client Details
                </option>
              </RenderOnRole>

              <RenderOnRole
                roles={[
                  SYSTEM_ROLES.READ_ONLY,
                  SYSTEM_ROLES.USER,
                  SYSTEM_ROLES.SYSTEM_ADMIN,
                ]}
              >
                <option value={REPORTS.DAIRY_FARM_TANK}>
                  Dairy Tank Recheck
                </option>
              </RenderOnRole>

              <RenderOnRole
                roles={[
                  SYSTEM_ROLES.READ_ONLY,
                  SYSTEM_ROLES.USER,
                  SYSTEM_ROLES.SYSTEM_ADMIN,
                ]}
              >
                <option value={REPORTS.DAIRY_TEST_THRESHOLD}>
                  Dairy Test Threshold
                </option>
              </RenderOnRole>

              <RenderOnRole
                roles={[
                  SYSTEM_ROLES.READ_ONLY,
                  SYSTEM_ROLES.USER,
                  SYSTEM_ROLES.SYSTEM_ADMIN,
                ]}
              >
                <option value={REPORTS.LICENCE_EXPIRY}>Licence Expiry</option>
              </RenderOnRole>

              <RenderOnRole
                roles={[
                  SYSTEM_ROLES.READ_ONLY,
                  SYSTEM_ROLES.USER,
                  SYSTEM_ROLES.SYSTEM_ADMIN,
                ]}
              >
                <option value={REPORTS.LICENCE_LOCATION}>
                  Licence Location
                </option>
              </RenderOnRole>

              <RenderOnRole
                roles={[
                  SYSTEM_ROLES.READ_ONLY,
                  SYSTEM_ROLES.USER,
                  SYSTEM_ROLES.INSPECTOR,
                  SYSTEM_ROLES.SYSTEM_ADMIN,
                ]}
              >
                <option value={REPORTS.APIARY_PRODUCER_REGION}>
                  Producer&apos;s Analysis Report by Region
                </option>
              </RenderOnRole>

              <RenderOnRole
                roles={[
                  SYSTEM_ROLES.READ_ONLY,
                  SYSTEM_ROLES.USER,
                  SYSTEM_ROLES.INSPECTOR,
                  SYSTEM_ROLES.SYSTEM_ADMIN,
                ]}
              >
                <option value={REPORTS.APIARY_PRODUCER_CITY}>
                  Producer City &amp; Municipality
                </option>
              </RenderOnRole>

              <RenderOnRole
                roles={[
                  SYSTEM_ROLES.READ_ONLY,
                  SYSTEM_ROLES.USER,
                  SYSTEM_ROLES.SYSTEM_ADMIN,
                ]}
              >
                <option value={REPORTS.DAIRY_FARM_QUALITY}>
                  Provincial Farm Quality
                </option>
              </RenderOnRole>
            </Form.Control>
          </Col>
        </Row>
        <div className="mt-3">{control}</div>
      </Container>
    </>
  );
}

Reports.propTypes = {};
