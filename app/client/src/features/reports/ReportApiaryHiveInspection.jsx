import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { Alert, Spinner, Table, Row, Col, Form, Button } from "react-bootstrap";

import { startOfToday, add } from "date-fns";

import { REQUEST_STATUS } from "../../utilities/constants";
import {
  formatDate,
  formatDateString,
  formatPhoneNumber,
  formatListShorten,
} from "../../utilities/formatting.ts";

import CustomDatePicker from "../../components/CustomDatePicker";
import DocGenDownloadBar from "../../components/DocGenDownloadBar";

import {
  fetchApiaryHiveInspection,
  startApiaryHiveInspectionJob,
  generateReport,
  selectQueuedReports,
  clearQueuedReport,
  fetchReportJob,
  selectReportsJob,
  clearReportsJob,
  completeReportJob,
} from "./reportsSlice";

export default function ReportApiaryHiveInspection() {
  const dispatch = useDispatch();

  const reportData = useSelector(selectQueuedReports);
  const job = useSelector(selectReportsJob);
  const { pendingDocuments } = job;

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, setValue, watch } = form;

  const startDate = startOfToday();
  const endDate = add(startOfToday(), { days: 15 });
  const watchStartDate = watch("startDate", startDate);
  const watchEndDate = watch("endDate", endDate);

  useEffect(() => {
    dispatch(clearQueuedReport());
    dispatch(clearReportsJob());

    setValue("startDate", startDate);
    setValue("endDate", endDate);
  }, [dispatch]);

  useEffect(() => {
    async function clearJobAndFetch() {
      await dispatch(clearReportsJob());
      await dispatch(
        fetchApiaryHiveInspection({
          startDate: watchStartDate,
          endDate: watchEndDate,
        })
      );
    }
    clearJobAndFetch();
  }, [watchStartDate, watchEndDate]);

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

  const handleFieldChange = (field) => {
    return (value) => {
      setValue(field, value);
    };
  };

  const onGenerateReport = () => {
    dispatch(
      startApiaryHiveInspectionJob({
        startDate: watchStartDate,
        endDate: watchEndDate,
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
                <th className="text-nowrap">Licence Number</th>
                <th className="text-nowrap">Region</th>
                <th className="text-nowrap">Status</th>
                <th className="text-nowrap">Apiary Site ID</th>
                <th className="text-nowrap">Inspection Date</th>
              </tr>
            </thead>
            <tbody>
              {reportData.data.map((item) => {
                return (
                  <tr
                    key={`${item.licenceId}_${formatDateString(
                      item.inspectionDate
                    )}`}
                  >
                    <td className="text-nowrap">{item.licenceNumber}</td>
                    <td className="text-nowrap">{item.regionName}</td>
                    <td className="text-nowrap">{item.licenceStatus}</td>
                    <td className="text-nowrap">{item.apiarySiteId}</td>
                    <td className="text-nowrap">{item.inspectionDate}</td>
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
        <Col lg={3}>
          <CustomDatePicker
            id="startDate"
            label="Start Date"
            notifyOnChange={handleFieldChange("startDate")}
            defaultValue={startDate}
          />
        </Col>
        <Col lg={3}>
          <CustomDatePicker
            id="endDate"
            label="End Date"
            notifyOnChange={handleFieldChange("endDate")}
            defaultValue={endDate}
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

ReportApiaryHiveInspection.propTypes = {};
