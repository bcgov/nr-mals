import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { Spinner, Alert, Container } from "react-bootstrap";

import { REQUEST_STATUS } from "../../utilities/constants";

import PageHeading from "../../components/PageHeading";
import SectionHeading from "../../components/SectionHeading";

import {
  fetchApiaryInspection,
  selectCurrentInspection,
  clearCreatedInspection,
} from "./inspectionsSlice";
import { fetchSite, selectCurrentSite } from "../sites/sitesSlice";
import { fetchLicence, selectCurrentLicence } from "../licences/licencesSlice";

import SiteHeader from "../sites/SiteHeader";
import LicenceDetailsView from "../licences/LicenceDetailsView";
import SiteDetailsView from "../sites/SiteDetailsView";
import InspectionDetailsViewEdit from "./InspectionDetailsViewEdit";

export default function ViewLicencePage() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const inspection = useSelector(selectCurrentInspection);
  const site = useSelector(selectCurrentSite);
  const licence = useSelector(selectCurrentLicence);

  useEffect(() => {
    dispatch(clearCreatedInspection());

    dispatch(fetchApiaryInspection(id)).then((apiaryRecord) =>
      dispatch(fetchSite(apiaryRecord.payload.siteId)).then((siteRecord) =>
        dispatch(fetchLicence(siteRecord.payload.licenceId))
      )
    );
  }, [dispatch, id]);

  let content;
  if (inspection.data && site.data && licence.data) {
    content = (
      <>
        <SiteHeader site={site.data} licence={licence.data} />
        <section>
          <SectionHeading>License Details</SectionHeading>
          <Container className="mt-3 mb-4">
            <LicenceDetailsView licence={licence.data} />
          </Container>
        </section>
        <section>
          <SectionHeading>Site Details</SectionHeading>
          <Container className="mt-3 mb-4">
            <SiteDetailsView
              site={site.data}
              licenceTypeId={licence.data.licenceTypeId}
            />
          </Container>
        </section>
        <section>
          <InspectionDetailsViewEdit
            inspection={inspection}
            site={site}
            licence={licence}
          />
        </section>
      </>
    );
  } else if (
    inspection.status === REQUEST_STATUS.IDLE ||
    inspection.status === REQUEST_STATUS.PENDING ||
    site.status === REQUEST_STATUS.IDLE ||
    site.status === REQUEST_STATUS.PENDING ||
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
          An error was encountered while loading the inspection.
        </Alert.Heading>
        {inspection.error && (
          <p>{`${inspection.error.code}: ${inspection.error.description}`}</p>
        )}
        {site.error && <p>{`${site.error.code}: ${site.error.description}`}</p>}
        {licence.error && (
          <p>{`${licence.error.code}: ${licence.error.description}`}</p>
        )}
      </Alert>
    );
  }

  return (
    <section>
      <PageHeading>View Inspection</PageHeading>
      {content}
    </section>
  );
}
