import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { Row, Col, Form, Button } from "react-bootstrap";

import { startOfToday, getYear } from "date-fns";

import DocGenDownloadBar from "../../components/DocGenDownloadBar";

import {
  startDairyTankRecheckJob,
  generateReport,
  fetchReportJob,
  selectReportsJob,
  completeReportJob,
} from "./reportsSlice";

import { REPORTS } from "../../utilities/constants";

export default function ReportDairyTankRecheck() {
  const dispatch = useDispatch();

  const job = useSelector(selectReportsJob);
  const { pendingDocuments } = job;

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, watch } = form;

  const today = startOfToday();
  const initialYear = getYear(today) + 1;
  const watchRecheckYear = watch("recheckYear", initialYear);

  useEffect(() => {}, [dispatch]);

  useEffect(() => {
    if (job.id && job.type === REPORTS.DAIRY_FARM_TANK) {
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
      startDairyTankRecheckJob({
        recheckYear: watchRecheckYear,
      })
    );
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
              ref={register}
            />
          </Form.Group>
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

ReportDairyTankRecheck.propTypes = {};
