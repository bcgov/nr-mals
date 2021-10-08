import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { Row, Col, Form, Button } from "react-bootstrap";

import { startOfToday, add } from "date-fns";

import CustomDatePicker from "../../components/CustomDatePicker";
import DocGenDownloadBar from "../../components/DocGenDownloadBar";

import {
  startApiaryHiveInspectionJob,
  generateReport,
  fetchReportJob,
  selectReportsJob,
  completeReportJob,
} from "./reportsSlice";

import { REPORTS } from "../../utilities/constants";

export default function ReportApiaryHiveInspection() {
  const dispatch = useDispatch();

  const job = useSelector(selectReportsJob);
  const { pendingDocuments } = job;

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { setValue, watch } = form;

  const startDate = startOfToday();
  const endDate = add(startOfToday(), { days: 15 });
  const watchStartDate = watch("startDate", startDate);
  const watchEndDate = watch("endDate", endDate);

  useEffect(() => {
    setValue("startDate", startDate);
    setValue("endDate", endDate);
  }, [dispatch]);

  useEffect(() => {
    if (job.id && job.type === REPORTS.APIARY_INSPECTION) {
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

ReportApiaryHiveInspection.propTypes = {};
