import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { Alert, Spinner, Table, Row, Col, Form, Button } from "react-bootstrap";

import { REQUEST_STATUS } from "../../utilities/constants";
import {
  formatPhoneNumber,
  formatListShorten,
} from "../../utilities/formatting.ts";
import LicenceTypes from "../lookups/LicenceTypes";

import DocGenDownloadBar from "../../components/DocGenDownloadBar";

import {
  fetchActionRequired,
  startActionRequiredJob,
  generateReport,
  selectQueuedReports,
  clearQueuedReport,
  fetchReportJob,
  selectReportsJob,
  clearReportsJob,
  completeReportJob,
} from "./reportsSlice";

import { isNullOrEmpty } from "../../utilities/parsing";

export default function ReportActionRequired() {
  const dispatch = useDispatch();

  const reportData = useSelector(selectQueuedReports);
  const job = useSelector(selectReportsJob);
  const { pendingDocuments } = job;

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, watch } = form;

  const selectedLicenceType = watch("licenceType", null);

  useEffect(() => {
    dispatch(clearQueuedReport());
    dispatch(clearReportsJob());
  }, [dispatch]);

  useEffect(() => {
    dispatch(clearReportsJob());

    if (!isNullOrEmpty(selectedLicenceType)) {
      dispatch(fetchActionRequired(selectedLicenceType));
    } else {
      dispatch(clearQueuedReport());
    }
  }, [selectedLicenceType]);

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

  const onGenerateReport = () => {
    dispatch(startActionRequiredJob(selectedLicenceType));
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
                <th className="text-nowrap">Region</th>
                <th className="text-nowrap">Licence Type</th>
                <th className="text-nowrap">Registrant</th>
                <th className="text-nowrap">Licence</th>
                <th className="text-nowrap">Status</th>
                <th className="text-nowrap">Site Contact</th>
                <th className="text-nowrap">Site Address</th>
                <th className="text-nowrap">Company Name</th>
                <th className="text-nowrap">Primary Phone</th>
                <th className="text-nowrap">Secondary Phone</th>
              </tr>
            </thead>
            <tbody>
              {reportData.data.map((item) => {
                return (
                  <tr key={item.licenceId}>
                    <td className="text-nowrap">{item.siteRegion}</td>
                    <td className="text-nowrap">{item.licenceType}</td>
                    <td className="text-nowrap">
                      {formatListShorten(item.registrantName)}
                    </td>
                    <td className="text-nowrap">{item.licenceNumber}</td>
                    <td className="text-nowrap">{item.licenceStatus}</td>
                    <td className="text-nowrap">{item.registrantName}</td>
                    <td className="text-nowrap">{item.siteAddress}</td>
                    <td className="text-nowrap">{item.companyName}</td>
                    <td className="text-nowrap">
                      {formatPhoneNumber(item.sitePrimaryPhone)}
                    </td>
                    <td className="text-nowrap">
                      {formatPhoneNumber(item.siteSecondaryPhone)}
                    </td>
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
        <Col sm={3}>
          <LicenceTypes
            ref={register}
            defaultValue={null}
            allowAny
            label="Select a Licence Type"
          />
        </Col>
        {reportData.status === REQUEST_STATUS.FULFILLED &&
        reportData.data.length > 0 ? (
          <Col sm={2}>
            <Form.Label>&nbsp;</Form.Label>
            <Button
              variant="primary"
              type="button"
              onClick={() => onGenerateReport()}
              block
            >
              Generate Report
            </Button>
          </Col>
        ) : null}
      </Row>
      <div className="mt-3">{content}</div>
      <div className="mt-3">
        <DocGenDownloadBar job={job} />
      </div>
    </>
  );
}

ReportActionRequired.propTypes = {};
