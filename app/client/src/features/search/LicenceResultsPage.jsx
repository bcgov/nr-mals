import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Alert, Container, Spinner, Row, Col } from "react-bootstrap";

import {
  REQUEST_STATUS,
  CREATE_LICENSES_PATHNAME,
} from "../../utilities/constants";

import LinkButton from "../../components/LinkButton";
import PageHeading from "../../components/PageHeading";

import { fetchLicenceResults, selectLicenceResults } from "./searchSlice";

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
  } else if (results.status === REQUEST_STATUS.FULFILLED) {
    control = (
      <Row className="mt-3">
        <Col sm={4}>
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
  }

  return (
    <section>
      <PageHeading>Licence Search Results</PageHeading>
      <Container>{control}</Container>
    </section>
  );
}
