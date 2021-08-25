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

import {
  selectCurrentLicence,
  updateAssociatedLicences,
  deleteAssociatedLicences,
} from "./licencesSlice";

import {
  clearAssociatedLicencesParameters,
  setAssociatedLicencesParameters,
  fetchAssociatedLicencesResults,
  selectAssociatedLicencesResults,
  setAssociatedLicencesSearchPage,
} from "../search/searchSlice";

import { REQUEST_STATUS, LICENSES_PATHNAME } from "../../utilities/constants";

import { formatDateString } from "../../utilities/formatting.ts";
import { parseAsInt } from "../../utilities/parsing";

import { openModal } from "../../app/appSlice";
import { CONFIRMATION } from "../../modals/ConfirmationModal";
import { LICENCE_SEARCH } from "../../modals/LicenceSearchModal";

function navigateToSearchPage(dispatch, page) {
  dispatch(setAssociatedLicencesSearchPage(page));
  dispatch(fetchAssociatedLicencesResults());
}

export default function AssociatedLicences({ licence }) {
  const dispatch = useDispatch();
  const currentLicence = useSelector(selectCurrentLicence);
  const results = useSelector(selectAssociatedLicencesResults);

  const submitting = currentLicence.status === REQUEST_STATUS.PENDING;

  useEffect(() => {
    dispatch(clearAssociatedLicencesParameters());
    dispatch(
      setAssociatedLicencesParameters({
        licenceId: licence.data.id,
        licenceTypeId: parseAsInt(licence.data.licenceTypeId),
      })
    );
    dispatch(fetchAssociatedLicencesResults());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAssociatedLicencesResults());
  }, [currentLicence]);

  const onConfirmAssociateCallback = (data) => {
    const updatedData = [...data];
    // Add the inverse data so both associations get created
    for (let i = 0; i < data.length; i += 1) {
      updatedData.push({
        parentLicenceId: data[i].childLicenceId,
        childLicenceId: data[i].parentLicenceId,
      });
    }
    dispatch(
      updateAssociatedLicences({
        data: updatedData,
        licenceId: licence.data.id,
      })
    );
  };

  const onAssociateCallback = (data) => {
    const confirmData = data.map((x) => {
      return {
        parentLicenceId: licence.data.id,
        childLicenceId: x.licenceId,
        childLicenceNumber: x.licenceNumber,
        childLicenceType: x.licenceType,
      };
    });

    dispatch(
      openModal(
        CONFIRMATION,
        onConfirmAssociateCallback,
        {
          data: confirmData,
          modalContent: (
            <>
              <Row>
                <div className="justify-content-center">
                  You have selected to associate the following licences to
                  Licence Number {licence.data.licenceNumber}.
                </div>
              </Row>
              <Row>
                <Table striped size="sm" responsive className="mt-3" hover>
                  <thead className="thead-dark">
                    <tr>
                      <th className="text-nowrap">Licence</th>
                      <th className="text-nowrap">Licence Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {confirmData.map((x, index) => {
                      return (
                        <tr key={index}>
                          <td className="text-nowrap">
                            {x.childLicenceNumber}
                          </td>
                          <td className="text-nowrap">{x.childLicenceType}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Row>
              <br />
              <Row>
                <div className="justify-content-center">
                  Do you wish to proceed?
                </div>
              </Row>
            </>
          ),
        },
        "lg"
      )
    );
  };

  function associatedLicenceOnClick() {
    dispatch(
      openModal(
        LICENCE_SEARCH,
        onAssociateCallback,
        { licenceTypeId: licence.data.licenceTypeId },
        "lg"
      )
    );
  }

  const onDeleteCallback = (data) => {
    const deleteData = {
      parentLicenceId: licence.data.id,
      childLicenceId: data.id,
    };

    dispatch(
      deleteAssociatedLicences({ data: deleteData, licenceId: licence.data.id })
    );
  };

  function unassociatedLicenceOnClick(childLicence) {
    dispatch(
      openModal(
        CONFIRMATION,
        onDeleteCallback,
        {
          data: childLicence,
          modalContent: (
            <>
              <Row>
                <div className="justify-content-center">
                  You have selected to remove the following from its association
                  to Licence Number {licence.data.licenceNumber}.
                </div>
              </Row>
              <Row>
                <Table striped size="sm" responsive className="mt-3" hover>
                  <thead className="thead-dark">
                    <tr>
                      <th className="text-nowrap">Licence</th>
                      <th className="text-nowrap">Licence Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-nowrap">
                        {childLicence.licenceNumber}
                      </td>
                      <td className="text-nowrap">
                        {childLicence.licenceType}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Row>
              <br />
              <Row>
                <div className="justify-content-center">
                  Do you wish to proceed?
                </div>
              </Row>
            </>
          ),
        },
        "lg"
      )
    );
  }

  function formatResultRow(result) {
    const url = `${LICENSES_PATHNAME}/${result.id}`;
    return (
      <tr key={result.id}>
        <td className="text-nowrap">
          <Link to={url}>{result.licenceNumber}</Link>
        </td>
        <td className="text-nowrap">{result.licenceType}</td>
        <td className="text-nowrap">
          {formatDateString(result.associatedOnDate)}
        </td>
        <td className="text-nowrap">
          {result.companyName !== undefined
            ? result.companyName
            : result.registrants[0].label}
        </td>
        <td>
          <Button
            variant="link"
            onClick={() => unassociatedLicenceOnClick(result)}
          >
            Remove
          </Button>
        </td>
      </tr>
    );
  }

  const associateLicenceButton = (
    <Button
      size="md"
      type="button"
      variant="secondary"
      onClick={associatedLicenceOnClick}
      disabled={submitting}
      block
    >
      Associate a new Licence
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
  } else if (
    results.status === REQUEST_STATUS.FULFILLED &&
    results.count === 0
  ) {
    control = (
      <>
        <Row className="mt-3">
          <Col lg={6}>
            <Alert variant="success" className="mt-3">
              <div>
                There are no other licences associated with this licence.
              </div>
            </Alert>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col lg={3}>{associateLicenceButton}</Col>
        </Row>
      </>
    );
  } else if (results.status === REQUEST_STATUS.FULFILLED && results.count > 0) {
    control = (
      <>
        <Table striped size="sm" responsive className="mt-3 mb-0" hover>
          <thead className="thead-dark">
            <tr>
              <th className="text-nowrap">Licence</th>
              <th className="text-nowrap">Licence Type</th>
              <th className="text-nowrap">Associated On</th>
              <th className="text-nowrap">Company/Registrant</th>
              <th />
            </tr>
          </thead>
          <tbody>{results.data.map((result) => formatResultRow(result))}</tbody>
        </Table>
        <Row className="mt-3">
          <Col lg={3}>{associateLicenceButton}</Col>
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
      <SectionHeading>Associated Licences</SectionHeading>
      <Container className="mt-3 mb-4">{control}</Container>
    </>
  );
}

AssociatedLicences.propTypes = {
  licence: PropTypes.object.isRequired,
};
