import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Row, Col, Form, Button } from "react-bootstrap";

import DocGenDownloadBar from "../../components/DocGenDownloadBar";

import {
  startDairyTrailerInspectionJob,
  generateReport,
  fetchReportJob,
  selectReportsJob,
  completeReportJob,
} from "../reports/reportsSlice";

import { REPORTS } from "../../utilities/constants";

export default function GenerateDairyTrailerInspection({ licenceNumber }) {
  const dispatch = useDispatch();

  const job = useSelector(selectReportsJob);
  const { pendingDocuments } = job;

  useEffect(() => {
    if (job.id && job.type === REPORTS.DAIRY_TRAILER_INSPECTION) {
      dispatch(fetchReportJob());

      if (pendingDocuments?.length > 0) {
        dispatch(generateReport(pendingDocuments[0].documentId));
      } else {
        dispatch(completeReportJob(job.id));
      }
    }
  }, [pendingDocuments]); // eslint-disable-line react-hooks/exhaustive-deps

  const onGenerateReport = () => {
    dispatch(
      startDairyTrailerInspectionJob({
        licenceNumber: licenceNumber,
      })
    );
  };

  return (
    <>
      <Row>
        <Col sm={3}>
          <Form.Label>&nbsp;</Form.Label>
          <Button
            variant="primary"
            type="button"
            onClick={() => onGenerateReport()}
            block
            disabled={!licenceNumber}
          >
            Generate Inspections Report
          </Button>
        </Col>
      </Row>
      <div className="mt-3">
        <DocGenDownloadBar job={job} />
      </div>
    </>
  );
}

GenerateDairyTrailerInspection.propTypes = {};
