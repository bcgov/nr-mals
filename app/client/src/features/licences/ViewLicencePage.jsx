import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, Redirect } from "react-router-dom";
import { Spinner, Alert } from "react-bootstrap";

import { REQUEST_STATUS, SITES_PATHNAME } from "../../utilities/constants";

import PageHeading from "../../components/PageHeading";
import RegistrantsViewEdit from "../registrants/RegistrantsViewEdit";
import {
  fetchLicence,
  clearCurrentLicence,
  selectCurrentLicence,
} from "./licencesSlice";
import { selectCreatedSite } from "../sites/sitesSlice";
import LicenceDetailsViewEdit from "./LicenceDetailsViewEdit";
import LicenceHeader from "./LicenceHeader";
import LicenceSites from "./LicenceSites";
import LicenceInventory from "./LicenceInventory";
import LicenceInventoryHistory from "./LicenceInventoryHistory";
import LicenceDairyTestInventory from "./LicenceDairyTestInventory";
import AssociatedLicences from "./AssociatedLicences";
import {
  LICENCE_TYPE_ID_GAME_FARM,
  LICENCE_TYPE_ID_FUR_FARM,
  LICENCE_TYPE_ID_LIVESTOCK_DEALER,
  LICENCE_TYPE_ID_LIVESTOCK_DEALER_AGENT,
  LICENCE_TYPE_ID_PUBLIC_SALE_YARD_OPERATOR,
  LICENCE_TYPE_ID_DISPENSER,
  LICENCE_TYPE_ID_VETERINARY_DRUG,
  LICENCE_TYPE_ID_MEDICATED_FEED,
  LICENCE_TYPE_ID_DAIRY_FARM,
} from "./constants";

import Comments from "../comments/Comments";

import "./ViewLicencePage.scss";

export default function ViewLicencePage() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const licence = useSelector(selectCurrentLicence);

  const createdSite = useSelector(selectCreatedSite);

  useEffect(() => {
    dispatch(clearCurrentLicence());
    dispatch(fetchLicence(id));
  }, [dispatch, id]);

  if (createdSite.status === REQUEST_STATUS.FULFILLED) {
    return <Redirect to={`${SITES_PATHNAME}/${createdSite.data.id}`} />;
  }

  const associatedLicenceTypes = [
    LICENCE_TYPE_ID_LIVESTOCK_DEALER,
    LICENCE_TYPE_ID_LIVESTOCK_DEALER_AGENT,
    LICENCE_TYPE_ID_PUBLIC_SALE_YARD_OPERATOR,
    LICENCE_TYPE_ID_DISPENSER,
    LICENCE_TYPE_ID_VETERINARY_DRUG,
    LICENCE_TYPE_ID_MEDICATED_FEED,
  ];

  const showAssociatedLicence =
    licence.data &&
    associatedLicenceTypes.find((x) => x === licence.data.licenceTypeId) !==
      undefined;

  let content;
  if (licence.data) {
    content = (
      <>
        <LicenceHeader licence={licence.data} />
        <RegistrantsViewEdit licence={licence} />
        <LicenceDetailsViewEdit licence={licence} />
        <LicenceSites licence={licence} />
        {licence.data.licenceTypeId === LICENCE_TYPE_ID_DAIRY_FARM ? (
          <LicenceDairyTestInventory licence={licence} />
        ) : null}
        {licence.data.licenceTypeId === LICENCE_TYPE_ID_GAME_FARM ||
        licence.data.licenceTypeId === LICENCE_TYPE_ID_FUR_FARM ? (
          <>
            <LicenceInventory licence={licence} />
            <LicenceInventoryHistory licence={licence} />
          </>
        ) : null}
        {showAssociatedLicence ? (
          <>
            <AssociatedLicences licence={licence} />
          </>
        ) : null}
        <Comments licence={licence.data} />
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
