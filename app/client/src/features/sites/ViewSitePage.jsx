/* eslint-disable */
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { Spinner, Alert, Container, Button } from "react-bootstrap";

import { REQUEST_STATUS } from "../../utilities/constants";

import PageHeading from "../../components/PageHeading";
import SectionHeading from "../../components/SectionHeading";

import { fetchSite, selectCurrentSite, clearCreatedSite } from "./sitesSlice";
import { fetchLicence, selectCurrentLicence } from "../licences/licencesSlice";

import SiteHeader from "./SiteHeader";
import LicenceDetailsView from "../licences/LicenceDetailsView";
import SiteDetailsViewEdit from "./SiteDetailsViewEdit";

import DairyTanksTab from "./dairytanks/DairyTanksTab";

import Comments from "../comments/Comments";

import "./ViewSitePage.scss";
import DairyTanksViewEdit from "./dairytanks/DairyTanksViewEdit";
import { LICENCE_TYPE_ID_DAIRY_FARM } from "../licences/constants";

export default function ViewLicencePage() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const site = useSelector(selectCurrentSite);
  const licence = useSelector(selectCurrentLicence);

  useEffect(() => {
    dispatch(clearCreatedSite());

    dispatch(fetchSite(id)).then((site) => {
      dispatch(fetchLicence(site.payload.licenceId));
    });
  }, [dispatch, id]);

  let content;
  if (site.data && licence.data) {
    content = (
      <>
        <SiteHeader site={site.data} licence={licence.data} />
        <section>
          <SectionHeading>License Details</SectionHeading>
          <Container className="mt-3 mb-4">
            <LicenceDetailsView licence={licence.data} />
          </Container>
        </section>

        <SiteDetailsViewEdit site={site} licence={licence.data} />
        {licence.data.licenceTypeId === LICENCE_TYPE_ID_DAIRY_FARM ? (
          <DairyTanksViewEdit site={site} />
        ) : null}
        <Comments licence={licence.data} />
      </>
    );
  } else if (
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
          An error was encountered while loading the site.
        </Alert.Heading>
        {site.error && <p>{`${site.error.code}: ${site.error.description}`}</p>}
        {licence.error && (
          <p>{`${licence.error.code}: ${licence.error.description}`}</p>
        )}
      </Alert>
    );
  }

  return (
    <section>
      <PageHeading>View a Site Record</PageHeading>
      {content}
    </section>
  );
}
