import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { Row, Col, Form, Button } from "react-bootstrap";

import { selectCities, fetchCities } from "../lookups/citiesSlice";
import Cities from "../lookups/Cities";

import DocGenDownloadBar from "../../components/DocGenDownloadBar";

import {
  startProducersAnalysisCityJob,
  generateReport,
  fetchReportJob,
  selectReportsJob,
  completeReportJob,
} from "./reportsSlice";

import { REPORTS } from "../../utilities/constants";

export default function ReportProducersAnalysisCity() {
  const dispatch = useDispatch();

  const cities = useSelector(selectCities);

  const job = useSelector(selectReportsJob);
  const { pendingDocuments } = job;

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, watch } = form;

  const watchCity = watch("city", null);
  const watchMinHives = watch("minHives", 0);
  const watchMaxHives = watch("maxHives", 0);

  useEffect(() => {
    dispatch(fetchCities());
  }, [dispatch]);

  useEffect(() => {
    if (job.id && job.type === REPORTS.APIARY_PRODUCER_CITY) {
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
      startProducersAnalysisCityJob({
        city: watchCity,
        minHives: watchMinHives,
        maxHives: watchMaxHives,
      })
    );
  };

  return (
    <>
      <Row>
        <Col sm={3}>
          <Cities cities={cities} ref={register} defaultValue={null} />
        </Col>
        <Col sm={2}>
          <Form.Label>Min Hives</Form.Label>
          <Form.Control
            type="number"
            name="minHives"
            defaultValue={0}
            ref={register}
          />
        </Col>
        <Col sm={2}>
          <Form.Label>Max Hives</Form.Label>
          <Form.Control
            type="number"
            name="maxHives"
            defaultValue={0}
            ref={register}
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

ReportProducersAnalysisCity.propTypes = {};
