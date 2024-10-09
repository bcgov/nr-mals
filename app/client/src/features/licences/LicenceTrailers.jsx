/* eslint-disable */
import React, { useEffect, useState } from "react";
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
import { startOfToday } from "date-fns";

import SectionHeading from "../../components/SectionHeading";

import { selectCreatedTrailer, createTrailer } from "../trailers/trailersSlice";
import {
  clearTrailerParameters,
  setTrailerParameters,
  fetchTrailerResults,
  selectTrailerResults,
  setTrailerSearchPage,
  setTrailerFilterText,
  clearTrailerFilterText,
} from "../search/searchSlice";

import { selectLicenceStatuses } from "../lookups/licenceStatusesSlice";

import {
  REQUEST_STATUS,
  LICENCE_STATUS_TYPES,
  COUNTRIES,
  PROVINCES,
  SYSTEM_ROLES,
  TRAILERS_PATHNAME,
} from "../../utilities/constants";

import ErrorMessageRow from "../../components/ErrorMessageRow";

import { selectCurrentUser } from "../../app/appSlice";
import GenerateDairyTrailerInspection from "./GenerateDairyTrailerInspection";
import { clearReportsJob } from "../reports/reportsSlice";

function formatResultRow(result) {
  const url = `${TRAILERS_PATHNAME}/${result.dairyFarmTrailerId}`;
  return (
    <tr key={result.dairyFarmTrailerId}>
      <td className="text-nowrap">
        <Link to={url}>
          {`${result.licenceNumber}-${result.licenceTrailerSeq}`}
        </Link>
      </td>
      <td className="text-nowrap">{result.licenceStatus}</td>
      <td className="text-nowrap">{result.registrantLastFirst}</td>
      <td className="text-nowrap">{result.geographicalDivision}</td>
    </tr>
  );
}

function navigateToSearchPage(dispatch, page) {
  dispatch(setTrailerSearchPage(page));
  dispatch(fetchTrailerResults());
}

export default function LicenceTrailers({ licence }) {
  const dispatch = useDispatch();
  const licenceStatuses = useSelector(selectLicenceStatuses);
  const results = useSelector(selectTrailerResults);
  const createdTrailer = useSelector(selectCreatedTrailer);
  const currentUser = useSelector(selectCurrentUser);

  const [debouncedActionTimeout, setDebouncedActionTimeout] = useState(null);

  useEffect(() => {
    dispatch(clearTrailerParameters());
    dispatch(clearTrailerFilterText());
    dispatch(
      setTrailerParameters({ licenceNumber: licence.data.licenceNumber })
    );
    dispatch(fetchTrailerResults());
    return () => {
      dispatch(clearReportsJob());
    };
  }, [dispatch]);

  const handleFilterTextChange = (e) => {
    const newFilterText = e.target.value;

    if (debouncedActionTimeout) {
      clearTimeout(debouncedActionTimeout);
    }

    const newTimeout = setTimeout(() => {
      dispatch(setTrailerSearchPage(1));
      dispatch(setTrailerFilterText(newFilterText));
      dispatch(fetchTrailerResults());
    }, 700);

    setDebouncedActionTimeout(newTimeout);
  };

  function addTrailerOnClick() {
    const payload = {
      licenceId: licence.data.id,
      licenceTypeId: licence.data.licenceTypeId,
      licenceStatus: licenceStatuses.data.find(
        (x) => x.code_description === LICENCE_STATUS_TYPES.ACTIVE
      ).id,
      country: COUNTRIES.CANADA,
      province: PROVINCES.BC,
      region: null,
      regionalDistrict: null,
      registrationDate: startOfToday(),
    };
    dispatch(createTrailer(payload));
  }

  const addTrailerButton = (
    <Button
      size="md"
      type="button"
      variant="primary"
      onClick={addTrailerOnClick}
      block
    >
      Add a Trailer
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
  } else if (createdTrailer.status === REQUEST_STATUS.REJECTED) {
    control = (
      <Alert variant="danger">
        <Alert.Heading>
          An error was encountered while creating a trailer.
        </Alert.Heading>
        <p>
          {createdTrailer.error.code}: {createdTrailer.error.description}
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
          errorMessage={"There are no trailers associated with this licence."}
        />
        {currentUser.data.roleId !== SYSTEM_ROLES.READ_ONLY &&
        currentUser.data.roleId !== SYSTEM_ROLES.INSPECTOR ? (
          <Row>
            <Col lg={2}>{addTrailerButton}</Col>
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
              <th>Trailer ID</th>
              <th className="text-nowrap">Trailer Status</th>
              <th className="text-nowrap">Name</th>
              <th className="text-nowrap">Division</th>
            </tr>
          </thead>
          <tbody>{results.data.map((result) => formatResultRow(result))}</tbody>
        </Table>
        <Row className="mt-3">
          {currentUser.data.roleId !== SYSTEM_ROLES.READ_ONLY &&
          currentUser.data.roleId !== SYSTEM_ROLES.INSPECTOR ? (
            <Col md="3">{addTrailerButton}</Col>
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
      <SectionHeading>Trailers</SectionHeading>
      <Container className="mt-3 mb-4">
        <div className="mb-3">
          <input
            type="text"
            placeholder="Filter trailers"
            onChange={handleFilterTextChange}
          />
        </div>
        {control}
      </Container>
      <SectionHeading>Inspections Report</SectionHeading>
      <Container className="mt-3 mb-4">
        <GenerateDairyTrailerInspection
          licenceNumber={licence?.data?.licenceNumber}
        />
      </Container>
    </>
  );
}

LicenceTrailers.propTypes = {
  licence: PropTypes.object.isRequired,
};
