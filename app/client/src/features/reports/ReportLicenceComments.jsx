import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { Row, Col, Form, Button } from "react-bootstrap";

import DocGenDownloadBar from "../../components/DocGenDownloadBar";

import {
  generateReport,
  fetchReportJob,
  selectReportsJob,
  completeReportJob,
  startLicenceCommentsJob,
} from "./reportsSlice";

import { REPORTS } from "../../utilities/constants";

export default function ReportLicenceComments() {
  const dispatch = useDispatch();

  const job = useSelector(selectReportsJob);
  const { pendingDocuments } = job;

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, watch } = form;

  const watchLicenceNumber = watch("licenceNumber", null);

  useEffect(() => {
    if (job.id && job.type === REPORTS.LICENCE_COMMENTS) {
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
      startLicenceCommentsJob({
        licenceNumber: watchLicenceNumber,
      })
    );
  };

  return (
    <>
      <Row>
        <Col lg={3}>
          <Form.Label>Licence Number</Form.Label>
          <Form.Control
            id="licenceNumber"
            type="text"
            name="licenceNumber"
            defaultValue={null}
            {...register("licenceNumber")}
          />
        </Col>
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
      </Row>
      <div className="mt-3">
        <DocGenDownloadBar job={job} />
      </div>
    </>
  );
}

ReportLicenceComments.propTypes = {};
