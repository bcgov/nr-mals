/* eslint-disable */
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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

import {
  REQUEST_STATUS,
  CREATE_LICENSES_PATHNAME,
  SITES_PATHNAME,
} from "../../utilities/constants";

import {
  formatDateString,
  formatListShorten,
} from "../../utilities/formatting.ts";

import LinkButton from "../../components/LinkButton";
import PageHeading from "../../components/PageHeading";

import {
  fetchSiteResults,
  selectSiteResults,
  setSiteSearchPage,
} from "./searchSlice";

function formatResultRow(result) {
  const url = `${SITES_PATHNAME}/${result.siteId}`;
  return (
    <tr key={result.siteId}>
      <td className="text-nowrap">
        <Link to={url}>
          {result.apiarySiteIdDisplay
            ? result.apiarySiteIdDisplay
            : result.siteId}
        </Link>
      </td>
      <td className="text-nowrap">
        {formatListShorten(result.registrantLastName)}
      </td>
      <td className="text-nowrap">
        {formatListShorten(result.registrantCompanyName)}
      </td>
      <td className="text-nowrap">{result.licenceNumber}</td>
      <td className="text-nowrap">{result.licenceCity}</td>
      <td className="text-nowrap">{result.licenceRegion}</td>
      <td className="text-nowrap">{result.licenceDistrict}</td>
      <td className="text-nowrap">
        {formatDateString(result.nextInspectionDate)}
      </td>
    </tr>
  );
}

function navigateToSearchPage(dispatch, page) {
  dispatch(setSiteSearchPage(page));
  dispatch(fetchSiteResults());
}

export default function SiteResultsPage() {
  const results = useSelector(selectSiteResults);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSiteResults());
  }, [dispatch]);

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
          <div>Sorry, there were no results matching your search terms.</div>
          <div>
            Search Tips: check your spelling and try again, or try a different
            search term.
          </div>
        </Alert>
      </>
    );
  } else if (results.status === REQUEST_STATUS.FULFILLED && results.count > 0) {
    control = (
      <>
        <Table striped size="sm" responsive className="mt-3" hover>
          <thead className="thead-dark">
            <tr>
              <th className="text-nowrap">Site ID</th>
              <th className="text-nowrap">Registrant Name</th>
              <th className="text-nowrap">Company Name</th>
              <th className="text-nowrap">Licence Number</th>
              <th className="text-nowrap">City</th>
              <th>Region</th>
              <th>District</th>
              <th className="text-nowrap">Next Inspection Date</th>
            </tr>
          </thead>
          <tbody>{results.data.map((result) => formatResultRow(result))}</tbody>
        </Table>
        <Row className="mt-3">
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
    <section>
      <PageHeading>Site Search Results</PageHeading>
      <Container>{control}</Container>
    </section>
  );
}
