import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { Alert, Spinner, Table, Row, Col, Form, Button } from "react-bootstrap";

import { REQUEST_STATUS } from "../../utilities/constants";
import {
  formatPhoneNumber,
  formatListShorten,
} from "../../utilities/formatting.ts";
import { isNullOrEmpty, parseAsInt } from "../../utilities/parsing";
import Regions from "../lookups/Regions";
import RegionalDistricts from "../lookups/RegionalDistricts";
import { selectRegions, fetchRegions } from "../lookups/regionsSlice";

import DocGenDownloadBar from "../../components/DocGenDownloadBar";

import {
  fetchProducersAnalysis,
  startProducersAnalysisRegionJob,
  startProducersAnalysisDistrictJob,
  generateReport,
  selectQueuedReports,
  clearQueuedReport,
  fetchReportJob,
  selectReportsJob,
  clearReportsJob,
  completeReportJob,
} from "./reportsSlice";

export default function ReportProducersAnalysis() {
  const dispatch = useDispatch();

  const regions = useSelector(selectRegions);

  const reportData = useSelector(selectQueuedReports);
  const job = useSelector(selectReportsJob);
  const { pendingDocuments } = job;

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, watch } = form;

  const watchRegion = watch("region", null);
  const parsedRegion = parseAsInt(watchRegion);

  const watchRegionalDistrict = watch("regionalDistrict", null);
  const parsedRegionalDistrict = parseAsInt(watchRegionalDistrict);

  useEffect(() => {
    dispatch(clearQueuedReport());
    dispatch(clearReportsJob());
    dispatch(fetchRegions());
  }, [dispatch]);

  useEffect(() => {
    if (
      !isNullOrEmpty(parsedRegion) &&
      !isNullOrEmpty(parsedRegionalDistrict)
    ) {
      dispatch(
        fetchProducersAnalysis({
          region: parsedRegion,
          district: parsedRegionalDistrict,
        })
      );
    }
  }, [parsedRegionalDistrict]);

  useEffect(() => {
    if (job.id) {
      dispatch(fetchReportJob());

      if (pendingDocuments?.length > 0) {
        dispatch(generateReport(pendingDocuments[0].documentId));
      } else {
        dispatch(completeReportJob(job.id));
      }
    }
  }, [pendingDocuments]); // eslint-disable-line react-hooks/exhaustive-deps

  const onGenerateRegionReport = () => {
    dispatch(
      startProducersAnalysisRegionJob({
        region: parsedRegion,
        district: parsedRegionalDistrict,
      })
    );
  };

  const onGenerateDistrictReport = () => {
    dispatch(
      startProducersAnalysisDistrictJob({
        region: parsedRegion,
        district: parsedRegionalDistrict,
      })
    );
  };

  let content = null;
  if (reportData.status === REQUEST_STATUS.PENDING) {
    content = (
      <div>
        <Spinner animation="border" role="status">
          <span className="sr-only">Retrieving...</span>
        </Spinner>
      </div>
    );
  } else if (reportData.status === REQUEST_STATUS.REJECTED) {
    content = (
      <Alert variant="danger">
        <Alert.Heading>
          An error was encountered while retrieving data.
        </Alert.Heading>
        <p>
          {reportData.error.code}: {reportData.error.description}
        </p>
      </Alert>
    );
  } else if (
    reportData.status === REQUEST_STATUS.FULFILLED &&
    reportData.data.length === 0
  ) {
    content = (
      <>
        <Alert variant="success">
          <div>No data found for this report.</div>
        </Alert>
      </>
    );
  } else if (
    reportData.status === REQUEST_STATUS.FULFILLED &&
    reportData.data.length > 0
  ) {
    content = (
      <>
        <div>
          <Table striped size="sm" responsive hover>
            <thead className="thead-dark">
              <tr>
                <th className="text-nowrap">Licence</th>
                <th className="text-nowrap">Site ID</th>
                <th className="text-nowrap">Registrant</th>
                <th className="text-nowrap">Address</th>
                <th className="text-nowrap">City</th>
                <th className="text-nowrap">Primary Phone</th>
                <th className="text-nowrap">Hive Count</th>
              </tr>
            </thead>
            <tbody>
              {reportData.data.map((item) => {
                return (
                  <tr key={item.siteId}>
                    <td className="text-nowrap">{item.licenceNumber}</td>
                    <td className="text-nowrap">{item.apiarySiteId}</td>
                    <td className="text-nowrap">
                      {item.registrantLastName}, {item.registrantFirstName}
                    </td>
                    <td className="text-nowrap">{item.siteAddress}</td>
                    <td className="text-nowrap">{item.siteCity}</td>
                    <td className="text-nowrap">
                      {formatPhoneNumber(item.sitePrimaryPhone)}
                    </td>
                    <td className="text-nowrap">{item.hiveCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </>
    );
  }

  return (
    <>
      <Row>
        <Col sm={4}>
          <Regions regions={regions} ref={register} />
        </Col>
        <Col sm={4}>
          <RegionalDistricts
            regions={regions}
            selectedRegion={parsedRegion}
            ref={register}
          />
        </Col>
        {reportData.status === REQUEST_STATUS.FULFILLED &&
        reportData.data.length > 0 ? (
          <>
            <Col sm={2}>
              <Form.Label>&nbsp;</Form.Label>
              <Button
                variant="primary"
                type="button"
                onClick={() => onGenerateRegionReport()}
                block
              >
                Generate Region Report
              </Button>
            </Col>
            <Col sm={2}>
              <Form.Label>&nbsp;</Form.Label>
              <Button
                variant="primary"
                type="button"
                onClick={() => onGenerateDistrictReport()}
                block
              >
                Generate District Report
              </Button>
            </Col>
          </>
        ) : null}
      </Row>
      <div className="mt-3">{content}</div>
      <div className="mt-3">
        <DocGenDownloadBar job={job} />
      </div>
    </>
  );
}

ReportProducersAnalysis.propTypes = {};
