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

import { createSite } from "../sites/sitesSlice";
import { fetchSiteResults, selectSiteResults, setSiteSearchPage } from "../search/searchSlice";

import {
  selectLicenceStatuses,
} from "../lookups/licenceStatusesSlice";

import { REQUEST_STATUS, LICENCE_STATUS_TYPES, SITES_PATHNAME } from "../../utilities/constants";

function formatResultRow(result) {
  console.log(result);
  const url = `${SITES_PATHNAME}/${result.id}`;
  return (
    <tr key={result.id}>
      <td className="text-nowrap">
        <Link to={url}>{result.id}</Link>
      </td>
      <td className="text-nowrap">{result.siteStatus}</td>
      <td className="text-nowrap">{result.lastName}</td>
      <td className="text-nowrap">{result.firstName}</td>
      <td className="text-nowrap">{result.addressLine1}</td>
      <td className="text-nowrap">{result.region}</td>
      <td className="text-nowrap">{result.district}</td>
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

  useEffect(() => {
    dispatch(fetchSiteResults(licence.data.id));
  }, [dispatch]);

  function addSiteOnClick() {
    const payload = {
      licenceId: licence.data.id,
      siteStatus: licenceStatuses.data.find( x => x.code_description === LICENCE_STATUS_TYPES.ACTIVE).id,
      region: null,
      regionalDistrict: null,
      addressLine1: null,
      addressLine2: null,
      city: null,
      province: null,
      postalCode: null,
      country: null,
      latitude: null,
      longitude: null,
      firstName: null,
      lastName: null,
      primaryPhone: null,
      secondaryPhone: null,
      email: null,
      legalDescriptionText: null,
    };
    dispatch(createSite(payload));
  }

  let addSiteButton = <Button
    size="md"
    type="button"
    variant="primary"
    onClick={addSiteOnClick}
    block
  >
    Add a Site
  </Button>

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
  } else if (
    results.status === REQUEST_STATUS.FULFILLED &&
    results.count === 0
  ) {
    control = (
      <>
        <Alert variant="success" className="mt-3">
          <div>There are no sites associated with this licence.</div>
        </Alert>
      </>
    );
  } else if (results.status === REQUEST_STATUS.FULFILLED && results.count > 0) {
    control = (
      <>
        <Table striped size="sm" responsive className="mt-3" hover>
          <thead className="thead-dark">
            <tr>
              <th>Licence</th>
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
          <Col md="3">{addSiteButton}</Col>
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
      <Container className="mt-3 mb-4">
        <Row>
          {control}
        </Row>
      </Container>
    </>
  );
}

LicenceSites.propTypes = {
  licence: PropTypes.object.isRequired,
};
