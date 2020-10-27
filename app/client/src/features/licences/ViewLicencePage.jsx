import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { Spinner, Alert } from "react-bootstrap";

import { REQUEST_STATUS, REGISTRANT_MODE } from "../../utilities/constants";

import PageHeading from "../../components/PageHeading";

import RegistrantsSection from "../registrants/RegistrantsSection";

import { fetchLicence, selectCurrentLicence } from "./licencesSlice";

import LicenceDetailsSection from "./LicenceDetailsSection";

import LicenceHeader from "./LicenceHeader";

import "./ViewLicencePage.scss";

export default function ViewLicencePage() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const licence = useSelector(selectCurrentLicence);

  useEffect(() => {
    dispatch(fetchLicence(id));
  }, [dispatch, id]);

  let content;
  if (licence.data) {
    content = (
      <>
        <LicenceHeader licence={licence.data} />
        <RegistrantsSection
          initialRegistrants={licence.data.registrants}
          mode={REGISTRANT_MODE.VIEW}
        />
        <LicenceDetailsSection licence={licence} />
      </>
    );
  } else if (
    licence.status === REQUEST_STATUS.IDLE ||
    licence.status === REQUEST_STATUS.PENDING
  ) {
    content = (
      <Spinner animation="border" role="status" variant="primary">
        <span className="sr-only">Loading...</span>
      </Spinner>
    );
  } else {
    content = (
      <Alert variant="danger">
        <Alert.Heading>
          An error was encountered while loading the licence.
        </Alert.Heading>
        {licence.error && (
          <p>{`${licence.error.code}: ${licence.error.description}`}</p>
        )}
      </Alert>
    );
  }

  return (
    <section>
      <PageHeading>Licence and Registrant Details</PageHeading>
      {content}
    </section>
  );
}
