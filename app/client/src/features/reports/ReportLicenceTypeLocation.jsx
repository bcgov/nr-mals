import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { Row, Col, Form, Button } from "react-bootstrap";

import DocGenDownloadBar from "../../components/DocGenDownloadBar";

import {
  startLicenceTypeLocationJob,
  generateReport,
  fetchReportJob,
  selectReportsJob,
  completeReportJob,
} from "./reportsSlice";

import {
  LICENCE_TYPE_ID_GAME_FARM,
  LICENCE_TYPE_ID_FUR_FARM,
} from "../licences/constants";

import { REPORTS } from "../../utilities/constants";

export default function ReportLicenceTypeLocation() {
  const dispatch = useDispatch();

  const job = useSelector(selectReportsJob);
  const { pendingDocuments } = job;

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, watch } = form;

  const watchLicenceType = watch("licenceTypeId", 1);

  useEffect(() => {
    if (job.id && job.type === REPORTS.LICENCE_LOCATION) {
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
      startLicenceTypeLocationJob({
        licenceTypeId: watchLicenceType,
      })
    );
  };

  return (
    <>
      <Row>
        <Col lg={3}>
          <Form.Label>Licence Type</Form.Label>
          <Form.Control
            as="select"
            name="licenceTypeId"
            defaultValue={LICENCE_TYPE_ID_GAME_FARM}
            ref={register}
            custom
          >
            <option
              key={LICENCE_TYPE_ID_GAME_FARM}
              value={LICENCE_TYPE_ID_GAME_FARM}
            >
              GAME FARM
            </option>
            <option
              key={LICENCE_TYPE_ID_FUR_FARM}
              value={LICENCE_TYPE_ID_FUR_FARM}
            >
              FUR FARM
            </option>
          </Form.Control>
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

ReportLicenceTypeLocation.propTypes = {};
