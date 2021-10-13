/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
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
  fetchLicenceSpecies,
  selectLicenceSpecies,
} from "../lookups/licenceSpeciesSlice";
import {
  selectCurrentLicence,
  deleteLicenceInventoryHistory,
} from "./licencesSlice";
import {
  clearInventoryHistoryParameters,
  setInventoryHistoryParameters,
  fetchInventoryHistoryResults,
  selectInventoryHistoryResults,
  setInventoryHistorySearchPage,
} from "../search/searchSlice";

import VerticalField from "../../components/VerticalField";
import { formatDateString } from "../../utilities/formatting";

import { REQUEST_STATUS, SPECIES_SUBCODES } from "../../utilities/constants";
import { parseAsDate } from "../../utilities/parsing";

import { openModal } from "../../app/appSlice";
import { CONFIRMATION } from "../../modals/ConfirmationModal";

import {
  LICENCE_TYPE_ID_GAME_FARM,
  LICENCE_TYPE_ID_FUR_FARM,
} from "./constants";

function navigateToSearchPage(dispatch, page) {
  dispatch(setInventoryHistorySearchPage(page));
  dispatch(fetchInventoryHistoryResults());
}

export default function LicenceInventoryHistory({ licence }) {
  const dispatch = useDispatch();
  const currentLicence = useSelector(selectCurrentLicence);
  const results = useSelector(selectInventoryHistoryResults);

  const licenceSpecies = useSelector(selectLicenceSpecies);

  function formatResultRow(result, showDelete = true) {
    const speciesData = getSpeciesData();

    const rowSpecies = speciesData.data.species.find(
      (sp) => sp.id == result.speciesCodeId
    );

    const rowSubSpecies = speciesData.data.subSpecies.find(
      (sp) => sp.id == result.speciesSubCodeId
    );

    return (
      <tr key={result.id}>
        <td className="text-nowrap">
          {rowSpecies !== undefined ? rowSpecies.codeDescription : null}
        </td>
        <td className="text-nowrap">{formatDateString(result.date)}</td>
        <td className="text-nowrap">
          {rowSubSpecies !== undefined ? rowSubSpecies.codeName : null}
        </td>
        <td className="text-nowrap">{result.value}</td>
        {showDelete === true ? (
          <td>
            <Button variant="link" onClick={async () => onDeleteRow(result)}>
              Delete
            </Button>
          </td>
        ) : null}
      </tr>
    );
  }

  useEffect(() => {
    switch (licence.data.licenceTypeId) {
      case LICENCE_TYPE_ID_GAME_FARM:
        dispatch(fetchLicenceSpecies());
        break;
      case LICENCE_TYPE_ID_FUR_FARM:
        dispatch(fetchLicenceSpecies());
        break;
      default:
        break;
    }

    dispatch(clearInventoryHistoryParameters());
    dispatch(
      setInventoryHistoryParameters({
        licenceId: licence.data.id,
        licenceTypeId: parseInt(licence.data.licenceTypeId),
      })
    );
    dispatch(fetchInventoryHistoryResults());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchInventoryHistoryResults());
  }, [currentLicence]);

  function getSpeciesData() {
    switch (licence.data.licenceTypeId) {
      case LICENCE_TYPE_ID_GAME_FARM:
        return licenceSpecies;
      case LICENCE_TYPE_ID_FUR_FARM:
        return licenceSpecies;
      default:
        return null;
    }
  }

  const onDeleteRow = (result) => {
    const data = { ...result };
    dispatch(
      openModal(
        CONFIRMATION,
        onDeleteCallback,
        {
          data,
          modalContent: (
            <>
              <Row>
                <div className="justify-content-center">
                  You are about to delete the following inventory history:
                </div>
              </Row>
              <Row>
                <Table striped size="sm" responsive className="mt-3" hover>
                  <thead className="thead-dark">
                    <tr>
                      <th className="text-nowrap">Species</th>
                      <th className="text-nowrap">Date</th>
                      <th className="text-nowrap">Code</th>
                      <th className="text-nowrap">Value</th>
                    </tr>
                  </thead>
                  <tbody>{formatResultRow(result, false)}</tbody>
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
        "md"
      )
    );
  };

  const onDeleteCallback = (data) => {
    console.log(data);
    dispatch(
      deleteLicenceInventoryHistory({ data, licenceId: licence.data.id })
    );
  };

  const calculateInventoryTotal = () => {
    let total = 0;

    if (getSpeciesData().status == REQUEST_STATUS.FULFILLED) {
      // Total = Most Recent Year Value for MALE + Most Recent Year Value for FEMALE

      const recentYear = Math.max.apply(
        Math,
        currentLicence.data.inventory.map(function (o, index) {
          return parseAsDate(o.date).getFullYear();
        })
      );

      currentLicence.data.inventory.map((x, index) => {
        const year = parseAsDate(x.date).getFullYear();
        if (year === recentYear) {
          const MALE_ID = getSpeciesData().data.subSpecies.find(
            (sp) =>
              sp.codeName === SPECIES_SUBCODES.MALE &&
              sp.speciesCodeId == x.speciesCodeId
          )?.id;
          const FEMALE_ID = getSpeciesData().data.subSpecies.find(
            (sp) =>
              sp.codeName === SPECIES_SUBCODES.FEMALE &&
              sp.speciesCodeId == x.speciesCodeId
          )?.id;
          const CALVES_ID = getSpeciesData().data.subSpecies.find(
            (sp) =>
              sp.codeName === SPECIES_SUBCODES.CALVES &&
              sp.speciesCodeId === x.speciesCodeId
          )?.id;

          if (
            x.speciesSubCodeId === MALE_ID ||
            x.speciesSubCodeId === FEMALE_ID ||
            x.speciesSubCodeId === CALVES_ID
          ) {
            let { value } = x;
            const parsed = parseInt(value);
            value = isNaN(parsed) ? 0 : parsed;
            total += value;
          }
        }
      });
    }

    return total;
  };

  let control = null;
  if (
    results.status === REQUEST_STATUS.PENDING ||
    getSpeciesData().status == REQUEST_STATUS.PENDING
  ) {
    control = (
      <div>
        <Spinner animation="border" role="status">
          <span className="sr-only">Searching...</span>
        </Spinner>
      </div>
    );
  } else if (
    results.status === REQUEST_STATUS.REJECTED ||
    getSpeciesData().status == REQUEST_STATUS.REJECTED
  ) {
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
    getSpeciesData().status === REQUEST_STATUS.FULFILLED &&
    results.count === 0
  ) {
    control = (
      <>
        <Row className="mt-3">
          <Col sm={12}>
            <Alert variant="success" className="mt-3">
              <div>There is no inventory associated with this licence.</div>
            </Alert>
          </Col>
        </Row>
      </>
    );
  } else if (
    results.status === REQUEST_STATUS.FULFILLED &&
    getSpeciesData().status === REQUEST_STATUS.FULFILLED &&
    results.count > 0
  ) {
    control = (
      <>
        <Table striped size="sm" responsive className="mt-3 mb-0" hover>
          <thead className="thead-dark">
            <tr>
              <th className="text-nowrap">Species</th>
              <th className="text-nowrap">Date</th>
              <th className="text-nowrap">Code</th>
              <th className="text-nowrap">Value</th>
              <th />
            </tr>
          </thead>
          <tbody>{results.data.map((result) => formatResultRow(result))}</tbody>
        </Table>
        <Row>
          <Col />
          <Col />
          <Col>
            <span className="float-right font-weight-bold">Total</span>
          </Col>
          <Col>
            <span>{calculateInventoryTotal()}</span>
          </Col>
          <Col />
        </Row>
        <Row className="mt-3">
          <Col md="3" />
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
      <SectionHeading>Inventory History</SectionHeading>
      <Container className="mt-3 mb-4">{control}</Container>
    </>
  );
}

LicenceInventoryHistory.propTypes = {
  licence: PropTypes.object.isRequired,
};
