import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { Row, Col, Form, Button } from "react-bootstrap";

import { selectRegions, fetchRegions } from "../lookups/regionsSlice";
import Regions from "../lookups/Regions";

import { parseAsInt } from "../../utilities/parsing";

import DocGenDownloadBar from "../../components/DocGenDownloadBar";

import {
  startApiarySiteJob,
  generateReport,
  fetchReportJob,
  selectReportsJob,
  completeReportJob,
} from "./reportsSlice";

import { REPORTS } from "../../utilities/constants";

export default function ReportApiarySite() {
  const dispatch = useDispatch();

  const regions = useSelector(selectRegions);

  const job = useSelector(selectReportsJob);
  const { pendingDocuments } = job;

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, watch } = form;

  const watchRegion = watch("region", null);

  useEffect(() => {
    dispatch(fetchRegions());
  }, [dispatch]);

  useEffect(() => {
    if (job.id && job.type === REPORTS.APIARY_SITE) {
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
      startApiarySiteJob({
        region: regions.data.regions.find(
          (x) => x.id === parseAsInt(watchRegion)
        ).region_name,
      })
    );
  };

  return (
    <>
      <Row>
        <Col sm={3}>
          <Regions regions={regions} ref={register} defaultValue={null} />
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

ReportApiarySite.propTypes = {};
