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
  fetchGameFarmSpecies,
  selectGameFarmSpecies,
} from "../lookups/gameFarmSlice";
import {
  fetchFurFarmSpecies,
  selectFurFarmSpecies,
} from "../lookups/furFarmSlice";
import { selectCurrentLicence } from "../licences/licencesSlice";
import {
  clearInventoryHistoryParameters,
  setInventoryHistoryParameters,
  fetchInventoryHistoryResults,
  selectInventoryHistoryResults,
  setInventoryHistorySearchPage,
} from "../search/searchSlice";

import VerticalField from "../../components/VerticalField";
import { formatDateString } from "../../utilities/formatting";

import {
  REQUEST_STATUS,
  GAME_FARM_SPECIES_SUBCODES,
} from "../../utilities/constants";
import { parseAsDate } from "../../utilities/parsing";

import {
  LICENCE_TYPE_ID_GAME_FARM,
  LICENCE_TYPE_ID_FUR_FARM,
} from "../licences/constants";

function navigateToSearchPage(dispatch, page) {
  dispatch(setInventoryHistorySearchPage(page));
  dispatch(fetchInventoryHistoryResults());
}

export default function LicenceInventoryHistory({ licence }) {
  const dispatch = useDispatch();
  const currentLicence = useSelector(selectCurrentLicence);
  const results = useSelector(selectInventoryHistoryResults);

  const gameFarmSpecies = useSelector(selectGameFarmSpecies);
  const furFarmSpecies = useSelector(selectFurFarmSpecies);

  function formatResultRow(result) {
    return (
      <tr key={result.id}>
        <td className="text-nowrap">
          {
            getSpeciesData().data.species.find(
              (sp) => sp.id == result.speciesCodeId
            ).codeDescription
          }
        </td>
        <td className="text-nowrap">{formatDateString(result.date)}</td>
        <td className="text-nowrap">
          {
            getSpeciesData().data.subSpecies.find(
              (sp) => sp.id == result.speciesSubCodeId
            ).codeName
          }
        </td>
        <td className="text-nowrap">{result.value}</td>
      </tr>
    );
  }

  useEffect(() => {
    switch (licence.data.licenceTypeId) {
      case LICENCE_TYPE_ID_GAME_FARM:
        dispatch(fetchGameFarmSpecies());
        break;
      case LICENCE_TYPE_ID_FUR_FARM:
        dispatch(fetchFurFarmSpecies());
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
        return gameFarmSpecies;
      case LICENCE_TYPE_ID_FUR_FARM:
        return furFarmSpecies;
      default:
        return null;
    }
  }

  const calculateInventoryTotal = () => {
    let total = 0;

    if (getSpeciesData().status == REQUEST_STATUS.FULFILLED) {
      //Total = Most Recent Year Value for MALE + Most Recent Year Value for FEMALE

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
              sp.codeName === GAME_FARM_SPECIES_SUBCODES.MALE &&
              sp.speciesCodeId == x.speciesCodeId
          )?.id;
          const FEMALE_ID = getSpeciesData().data.subSpecies.find(
            (sp) =>
              sp.codeName === GAME_FARM_SPECIES_SUBCODES.FEMALE &&
              sp.speciesCodeId == x.speciesCodeId
          )?.id;

          if (
            x.speciesSubCodeId === MALE_ID ||
            x.speciesSubCodeId === FEMALE_ID
          ) {
            let value = x.value;
            let parsed = parseInt(value);
            value = isNaN(parsed) ? 0 : parsed;
            total += value;
          }
        }
      });
    }

    return total;
  };

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
              <div>There is no inventory associated with this licence.</div>
            </Alert>
          </Col>
        </Row>
      </>
    );
  } else if (results.status === REQUEST_STATUS.FULFILLED && results.count > 0) {
    control = (
      <>
        <Table striped size="sm" responsive className="mt-3" hover>
          <thead className="thead-dark">
            <tr>
              <th className="text-nowrap">Species</th>
              <th className="text-nowrap">Date</th>
              <th className="text-nowrap">Code</th>
              <th className="text-nowrap">Value</th>
            </tr>
          </thead>
          <tbody>{results.data.map((result) => formatResultRow(result))}</tbody>
        </Table>
        <Row>
          <Col lg={10}></Col>
          <Col lg={2}>
            <span className="font-weight-bold">Total Value: </span>
            <span>{calculateInventoryTotal()}</span>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col md="3"></Col>
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

  // if( currentLicence.status !== REQUEST_STATUS.FULFILLED || getSpeciesData().status !== REQUEST_STATUS.FULFILLED) {
  //   return (
  //     <>
  //       <SectionHeading>Inventory History</SectionHeading>
  //       <Container className="mt-3 mb-4"></Container>
  //       <Spinner animation="border" role="status" variant="primary">
  //         <span className="sr-only">Loading...</span>
  //       </Spinner>
  //     </>
  //   );
  // }

  // if( currentLicence.status === REQUEST_STATUS.FULFILLED && getSpeciesData().status === REQUEST_STATUS.FULFILLED ) {
  //   const inventory = currentLicence.data.inventory;
  //   return (
  //     <>
  //       <SectionHeading>Inventory History</SectionHeading>
  //       <Container className="mt-3 mb-4">
  //         <Row className="mb-3">
  //           <Col className="font-weight-bold">Species</Col>
  //           <Col className="font-weight-bold">Date</Col>
  //           <Col className="font-weight-bold">Code</Col>
  //           <Col className="font-weight-bold">Value</Col>
  //         </Row>
  //         {
  //           inventory.map( (x, index) => {
  //             {console.log(x)}
  //             return <Row key={index}>
  //               <Col>
  //                 <VerticalField value={getSpeciesData().data.species.find( sp => sp.id == x.speciesCodeId ).codeDescription} />
  //               </Col>
  //               <Col>
  //                 <VerticalField value={formatDateString(x.date)} />
  //               </Col>
  //               <Col>
  //                 <VerticalField value={getSpeciesData().data.subSpecies.find( sp => sp.id == x.speciesSubCodeId ).codeName} />
  //               </Col>
  //               <Col>
  //                 <VerticalField value={x.value} />
  //               </Col>
  //             </Row>;
  //           })
  //         }
  //         <Row className="mt-3">
  //           <Col lg={2}>
  //           </Col>
  //           <Col lg={7}>
  //             <span className="float-right font-weight-bold">Total</span>
  //           </Col>
  //           <Col lg={3}>
  //             <span>{calculateInventoryTotal()}</span>
  //           </Col>
  //         </Row>

  //       </Container>
  //     </>
  //   );
  // }
}

LicenceInventoryHistory.propTypes = {
  licence: PropTypes.object.isRequired,
};
