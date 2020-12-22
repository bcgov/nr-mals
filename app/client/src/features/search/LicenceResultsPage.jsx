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
} from "../../utilities/constants";

import {
  formatDateString,
  formatListShorten,
} from "../../utilities/formatting.ts";

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
    <tr>
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
      <Alert variant="success">
        <div>Sorry, there were no results matching your search terms.</div>
        <div>
          Search Tips: check your spelling and try again, or try a different
          search term.
        </div>
      </Alert>
    );
  } else if (results.status === REQUEST_STATUS.FULFILLED && results.count > 0) {
    control = (
      <>
        <Table striped size="sm" responsive className="mt-3" hover>
          <thead className="thead-dark">
            <th>Licence</th>
            <th className="text-nowrap">Licence Type</th>
            <th className="text-nowrap">Last Names</th>
            <th className="text-nowrap">Company Names</th>
            <th className="text-nowrap">Licence Status</th>
            <th className="text-nowrap">Issued On Date</th>
            <th className="text-nowrap">Expiry Date</th>
            <th>Region</th>
            <th>District</th>
          </thead>
          <tbody>{results.data.map((result) => formatResultRow(result))}</tbody>
        </Table>
        <Row className="mt-3">
          <Col lg={{ span: 6, offset: 6 }}>
            <Row>
              <Col>
                Showing {results.data.length} of {results.count} entries
              </Col>
              <Col>
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
                    onClick={() =>
                      navigateToSearchPage(dispatch, (results.page ?? 0) + 1)
                    }
                  >
                    Next
                  </Button>
                </ButtonGroup>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col lg={4}>
            <Link
              to={CREATE_LICENSES_PATHNAME}
              component={LinkButton}
              variant="primary"
              block
            >
              Create Licence
            </Link>
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
