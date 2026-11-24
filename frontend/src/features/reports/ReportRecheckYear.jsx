import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { Row, Col, Form, Button } from "react-bootstrap";

import DocGenDownloadBar from "../../components/DocGenDownloadBar";

import {
  generateReport,
  fetchReportJob,
  selectReportsJob,
  completeReportJob,
} from "./reportsSlice";

// Shared by the reports that are generated for a single re-check year
export default function ReportRecheckYear({
  reportType,
  startJob,
  initialYear,
}) {
  const dispatch = useDispatch();

  const job = useSelector(selectReportsJob);
  const { pendingDocuments } = job;

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, watch } = form;

  const watchRecheckYear = watch("recheckYear", initialYear);

  useEffect(() => {
    if (job.id && job.type === reportType) {
      dispatch(fetchReportJob());

      if (pendingDocuments?.length > 0) {
        dispatch(generateReport(pendingDocuments[0].documentId));
      } else {
        dispatch(completeReportJob(job.id));
      }
    }
  }, [pendingDocuments]); // eslint-disable-line react-hooks/exhaustive-deps

  const onGenerateReport = () => {
    dispatch(startJob({ recheckYear: watchRecheckYear }));
  };

  return (
    <>
      <Row>
        <Col lg={3}>
          <Form.Group controlId="recheckYear">
            <Form.Label>Re-check Year</Form.Label>
            <Form.Control
              type="number"
              name="recheckYear"
              defaultValue={initialYear}
              {...register("recheckYear")}
            />
          </Form.Group>
        </Col>
        <Col sm={2}>
          <Form.Label>&nbsp;</Form.Label>
          <Button
            variant="primary"
            type="button"
            onClick={onGenerateReport}
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

ReportRecheckYear.propTypes = {
  reportType: PropTypes.string.isRequired,
  startJob: PropTypes.func.isRequired,
  initialYear: PropTypes.number.isRequired,
};
