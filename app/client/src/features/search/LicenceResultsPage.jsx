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
  LICENSES_PATHNAME,
  SYSTEM_ROLES,
} from "../../utilities/constants";

import {
  formatDateString,
  formatListShorten,
} from "../../utilities/formatting.ts";

import RenderOnRole from "../../components/RenderOnRole";
import LinkButton from "../../components/LinkButton";
import PageHeading from "../../components/PageHeading";

import {
  fetchLicenceResults,
  selectLicenceResults,
  setLicenceSearchPage,
} from "./searchSlice";

function formatResultRow(result) {
  const url = `${LICENSES_PATHNAME}/${result.licenceId}`;
  return (
    <tr key={result.licenceId}>
      <td className="text-nowrap">
        <Link to={url}>{result.licenceNumber}</Link>
      </td>
      <td className="text-nowrap">{result.licenceType}</td>
      <td className="text-nowrap">{formatListShorten(result.lastNames)}</td>
      <td className="text-nowrap">{formatListShorten(result.companyNames)}</td>
      <td className="text-nowrap">{result.licenceStatus}</td>
      <td className="text-nowrap">{formatDateString(result.issuedOnDate)}</td>
      <td className="text-nowrap">{formatDateString(result.expiryDate)}</td>
      <td className="text-nowrap">{result.region}</td>
      <td className="text-nowrap">{result.regionalDistrict}</td>
    </tr>
  );
}

function navigateToSearchPage(dispatch, page) {
  dispatch(setLicenceSearchPage(page));
  dispatch(fetchLicenceResults());
}

export default function LicenceResultsPage() {
  const results = useSelector(selectLicenceResults);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchLicenceResults());
  }, [dispatch]);

  let control = null;
  const createLicenceButton = (
    <Link
      to={CREATE_LICENSES_PATHNAME}
      component={LinkButton}
      variant="primary"
      block
    >
      Create Licence
    </Link>
  );

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
        <RenderOnRole roles={[SYSTEM_ROLES.USER, SYSTEM_ROLES.SYSTEM_ADMIN]}>
          <Row className="mt-3">
            <Col md="3">{createLicenceButton}</Col>
          </Row>
        </RenderOnRole>
      </>
    );
  } else if (results.status === REQUEST_STATUS.FULFILLED && results.count > 0) {
    control = (
      <>
        <Table striped size="sm" responsive className="mt-3" hover>
          <thead className="thead-dark">
            <tr>
              <th>Licence</th>
              <th className="text-nowrap">Licence Type</th>
              <th className="text-nowrap">Last Names</th>
              <th className="text-nowrap">Company Names</th>
              <th className="text-nowrap">Licence Status</th>
              <th className="text-nowrap">Issued On Date</th>
              <th className="text-nowrap">Expiry Date</th>
              <th>Region</th>
              <th>District</th>
            </tr>
          </thead>
          <tbody>{results.data.map((result) => formatResultRow(result))}</tbody>
        </Table>
        <Row className="mt-3">
          <RenderOnRole roles={[SYSTEM_ROLES.USER, SYSTEM_ROLES.SYSTEM_ADMIN]}>
            <Col md="3">{createLicenceButton}</Col>
          </RenderOnRole>
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
      <PageHeading>Licence Search Results</PageHeading>
      <Container>{control}</Container>
    </section>
  );
}
