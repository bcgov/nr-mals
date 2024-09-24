import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { Spinner, Alert, Container } from "react-bootstrap";

import { REQUEST_STATUS } from "../../utilities/constants";

import PageHeading from "../../components/PageHeading";
import SectionHeading from "../../components/SectionHeading";

import {
  fetchTrailerInspection,
  selectCurrentInspection,
  clearCreatedInspection,
} from "./trailerInspectionsSlice";
import { fetchTrailer, selectCurrentTrailer } from "../trailers/trailersSlice";
import { fetchLicence, selectCurrentLicence } from "../licences/licencesSlice";

import TrailerHeader from "../trailers/TrailerHeader";
import LicenceDetailsView from "../licences/LicenceDetailsView";
import TrailerDetailsView from "../trailers/TrailerDetailsView";
import TrailerInspectionDetailsViewEdit from "./TrailerInspectionDetailsViewEdit";

export default function ViewTrailerInspectionPage() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const inspection = useSelector(selectCurrentInspection);
  const trailer = useSelector(selectCurrentTrailer);
  const licence = useSelector(selectCurrentLicence);

  useEffect(() => {
    dispatch(clearCreatedInspection());

    dispatch(fetchTrailerInspection(id)).then((inspectionRecord) =>
      dispatch(fetchTrailer(inspectionRecord.payload.trailerId)).then(
        (trailerRecord) =>
          dispatch(fetchLicence(trailerRecord.payload.licenceId))
      )
    );
  }, [dispatch, id]);

  let content;
  if (inspection.data && trailer.data && licence.data) {
    content = (
      <>
        <TrailerHeader trailer={trailer.data} licence={licence.data} />
        <section>
          <SectionHeading>License Details</SectionHeading>
          <Container className="mt-3 mb-4">
            <LicenceDetailsView licence={licence.data} />
          </Container>
        </section>
        <section>
          <SectionHeading>Trailer Details</SectionHeading>
          <Container className="mt-3 mb-4">
            <TrailerDetailsView
              trailer={trailer.data}
              licenceTypeId={licence.data.licenceTypeId}
            />
          </Container>
        </section>
        <section>
          <TrailerInspectionDetailsViewEdit
            inspection={inspection}
            trailer={trailer}
            licence={licence}
          />
        </section>
      </>
    );
  } else if (
    inspection.status === REQUEST_STATUS.IDLE ||
    inspection.status === REQUEST_STATUS.PENDING ||
    trailer.status === REQUEST_STATUS.IDLE ||
    trailer.status === REQUEST_STATUS.PENDING ||
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
        {trailer.error && (
          <p>{`${trailer.error.code}: ${trailer.error.description}`}</p>
        )}
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
