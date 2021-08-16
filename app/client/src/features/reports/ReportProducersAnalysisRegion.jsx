import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Row, Col, Form, Button } from "react-bootstrap";

import DocGenDownloadBar from "../../components/DocGenDownloadBar";

import {
  startProducersAnalysisRegionJob,
  generateReport,
  fetchReportJob,
  selectReportsJob,
  clearReportsJob,
  completeReportJob,
} from "./reportsSlice";

export default function ReportProducersAnalysisRegion() {
  const dispatch = useDispatch();

  const job = useSelector(selectReportsJob);
  const { pendingDocuments } = job;

  useEffect(() => {
    dispatch(clearReportsJob());
  }, [dispatch]);

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
    dispatch(startProducersAnalysisRegionJob());
  };

  return (
    <>
      <Row>
        <Col sm={2}>
          <Form.Label>&nbsp;</Form.Label>
          <Button
            variant="primary"
            type="button"
            onClick={() => onGenerateRegionReport()}
            block
          >
            Generate Report
          </Button>
        </Col>
      </Row>
      <div className="mt-3">
        <DocGenDownloadBar job={job} />
      </div>
    </>
  );
}

ReportProducersAnalysisRegion.propTypes = {};
