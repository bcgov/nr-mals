/* eslint-disable */
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  Alert,
  Container,
  Spinner,
  Table,
  Row,
  Col,
  Button,
  ButtonGroup,
} from "react-bootstrap";

import SectionHeading from "../../components/SectionHeading";

import { selectCreatedSite, createSite } from "../sites/sitesSlice";
import {
  clearSiteParameters,
  setSiteParameters,
  fetchSiteResults,
  selectSiteResults,
  setSiteSearchPage,
} from "../search/searchSlice";

import { selectLicenceStatuses } from "../lookups/licenceStatusesSlice";

import {
  REQUEST_STATUS,
  LICENCE_STATUS_TYPES,
  SITES_PATHNAME,
  COUNTRIES,
  PROVINCES,
  SYSTEM_ROLES,
} from "../../utilities/constants";

import ErrorMessageRow from "../../components/ErrorMessageRow";

import { selectCurrentUser } from "../../app/appSlice";

function formatResultRow(result) {
  const url = `${SITES_PATHNAME}/${result.siteId}`;
  return (
    <tr key={result.siteId}>
      <td className="text-nowrap">
        <Link to={url}>
          {result.apiarySiteIdDisplay
            ? `${result.apiarySiteIdDisplay}`
            : result.siteId}
        </Link>
      </td>
      <td className="text-nowrap">{result.siteStatus}</td>
      <td className="text-nowrap">{result.registrantLastName}</td>
      <td className="text-nowrap">{result.registrantFirstName}</td>
      <td className="text-nowrap">{result.siteAddressLine1}</td>
      <td className="text-nowrap">{result.licenceRegion}</td>
      <td className="text-nowrap">{result.licenceDistrict}</td>
    </tr>
  );
}

function navigateToSearchPage(dispatch, page) {
  dispatch(setSiteSearchPage(page));
  dispatch(fetchSiteResults());
}

export default function LicenceSites({ licence }) {
  const dispatch = useDispatch();
  const licenceStatuses = useSelector(selectLicenceStatuses);
  const results = useSelector(selectSiteResults);
  const createdSite = useSelector(selectCreatedSite);
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    dispatch(clearSiteParameters());
    dispatch(setSiteParameters({ licenceNumber: licence.data.licenceNumber }));
    dispatch(fetchSiteResults());
  }, [dispatch]);

  function addSiteOnClick() {
    const payload = {
      licenceId: licence.data.id,
      licenceTypeId: licence.data.licenceTypeId,
      siteStatus: licenceStatuses.data.find(
        (x) => x.code_description === LICENCE_STATUS_TYPES.ACTIVE
      ).id,
      country: COUNTRIES.CANADA,
      province: PROVINCES.BC,
      region: null,
      regionalDistrict: null,
    };
    dispatch(createSite(payload));
  }

  const addSiteButton = (
    <Button
      size="md"
      type="button"
      variant="primary"
      onClick={addSiteOnClick}
      block
    >
      Add a Site
    </Button>
  );

  let control = null;
  if (results.status === REQUEST_STATUS.PENDING) {
    control = (
      <div>
        <Spinner animation="border" role="status">
          <span className="sr-only">Searching...</span>
        </Spinner>
      </div>
    );
  } else if (results.status === REQUEST_STATUS.REJECTED) {
    control = (
      <Alert variant="danger">
        <Alert.Heading>
          An error was encountered while retrieving results.
        </Alert.Heading>
        <p>
          {results.error.code}: {results.error.description}
        </p>
      </Alert>
    );
  } else if (createdSite.status === REQUEST_STATUS.REJECTED) {
    control = (
      <Alert variant="danger">
        <Alert.Heading>
          An error was encountered while creating a site.
        </Alert.Heading>
        <p>
          {createdSite.error.code}: {createdSite.error.description}
        </p>
      </Alert>
    );
  } else if (
    results.status === REQUEST_STATUS.FULFILLED &&
    results.count === 0
  ) {
    control = (
      <>
        <ErrorMessageRow
          variant="success"
          errorHeading={null}
          errorMessage={"There are no sites associated with this licence."}
        />
        {currentUser.data.roleId !== SYSTEM_ROLES.READ_ONLY &&
        currentUser.data.roleId !== SYSTEM_ROLES.INSPECTOR ? (
          <Row>
            <Col lg={2}>{addSiteButton}</Col>
          </Row>
        ) : null}
      </>
    );
  } else if (results.status === REQUEST_STATUS.FULFILLED && results.count > 0) {
    control = (
      <>
        <Table striped size="sm" responsive className="mt-3" hover>
          <thead className="thead-dark">
            <tr>
              <th>Site ID</th>
              <th className="text-nowrap">Site Status</th>
              <th className="text-nowrap">Last Name</th>
              <th className="text-nowrap">First Name</th>
              <th className="text-nowrap">Address</th>
              <th>Region</th>
              <th>District</th>
            </tr>
          </thead>
          <tbody>{results.data.map((result) => formatResultRow(result))}</tbody>
        </Table>
        <Row className="mt-3">
          {currentUser.data.roleId !== SYSTEM_ROLES.READ_ONLY &&
          currentUser.data.roleId !== SYSTEM_ROLES.INSPECTOR ? (
            <Col md="3">{addSiteButton}</Col>
          ) : null}
          <Col className="d-flex justify-content-center">
            Showing {results.data.length} of {results.count} entries
          </Col>
          <Col md="auto">
            <ButtonGroup>
              <Button
                disabled={results.page < 2}
                onClick={() =>
                  navigateToSearchPage(dispatch, (results.page ?? 2) - 1)
                }
              >
                Previous
              </Button>
              <Button disabled>{results.page}</Button>
              <Button
                disabled={results.page * 20 > results.count}
                onClick={() =>
                  navigateToSearchPage(dispatch, (results.page ?? 0) + 1)
                }
              >
                Next
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      </>
    );
  }

  return (
    <>
      <SectionHeading>Sites</SectionHeading>
      <Container className="mt-3 mb-4">{control}</Container>
    </>
  );
}

LicenceSites.propTypes = {
  licence: PropTypes.object.isRequired,
};
