import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { Row, Col, Form, Button } from "react-bootstrap";

import LicenceTypes from "../lookups/LicenceTypes";

import DocGenDownloadBar from "../../components/DocGenDownloadBar";

import {
  startActionRequiredJob,
  generateReport,
  fetchReportJob,
  selectReportsJob,
  completeReportJob,
} from "./reportsSlice";

import { REPORTS } from "../../utilities/constants";

export default function ReportActionRequired() {
  const dispatch = useDispatch();

  const job = useSelector(selectReportsJob);
  const { pendingDocuments } = job;

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, watch } = form;

  const selectedLicenceType = watch("licenceType", null);

  useEffect(() => {
    if (job.id && job.type === REPORTS.ACTION_REQUIRED) {
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

ReportActionRequired.propTypes = {};
