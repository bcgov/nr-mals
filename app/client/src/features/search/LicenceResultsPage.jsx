import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Alert, Container, Spinner } from "react-bootstrap";

import { REQUEST_STATUS } from "../../utilities/constants";

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
    control = <div>Returned {results.data.length} results.</div>;
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
