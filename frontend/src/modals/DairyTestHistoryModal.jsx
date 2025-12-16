import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import {
  Alert,
  Spinner,
  Table,
  Row,
  Col,
  Button,
  ButtonGroup,
  Modal,
} from "react-bootstrap";

import { REQUEST_STATUS } from "../utilities/constants";

import {
  fetchDairyTestHistoryResults,
  selectDairyTestHistoryResults,
  setDairyTestHistoryParameters,
  setDairyTestHistorySearchPage,
} from "../features/search/searchSlice";

export const DAIRY_TEST_HISTORY_SEARCH = "DAIRY_TEST_HISTORY_SEARCH";

function navigateToSearchPage(dispatch, page) {
  dispatch(setDairyTestHistorySearchPage(page));
  dispatch(fetchDairyTestHistoryResults());
}

export default function DairyTestHistoryModal({ licenceId, closeModal }) {
  const results = useSelector(selectDairyTestHistoryResults);
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchData() {
      // eslint-disable-next-line
      await dispatch(setDairyTestHistoryParameters({ licenceId: licenceId }));
      dispatch(fetchDairyTestHistoryResults());
    }
    fetchData();
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
          <div>There is no history for this licence.</div>
        </Alert>
      </>
    );
  } else if (results.status === REQUEST_STATUS.FULFILLED && results.count > 0) {
    control = (
      <>
        <Table striped size="sm" responsive className="mt-3" hover>
          <thead className="thead-dark">
            <tr>
              <th className="font-weight-bold">Date</th>
              <th className="font-weight-bold">IBC Value</th>
              <th className="font-weight-bold">IBC Action</th>
              <th className="font-weight-bold">SCC Value</th>
              <th className="font-weight-bold">SCC Action</th>
              <th className="font-weight-bold">WATER Value</th>
              <th className="font-weight-bold">WATER Action</th>
              <th className="font-weight-bold">FFA Value</th>
              <th className="font-weight-bold">FFA Action</th>
              <th className="font-weight-bold">IH Value</th>
              <th className="font-weight-bold">IH Action</th>
            </tr>
          </thead>
          <tbody>
            {results.data.map((result, index) => {
              return (
                <tr key={index}>
                  <td className="text-nowrap">{result.spc1Date}</td>
                  <td className="text-nowrap">{result.spc1Value}</td>
                  <td className="text-nowrap">
                    {result.spc1CorrespondenceDescription}
                    {result.spc1LevyPercentage
                      ? ` (${result.spc1LevyPercentage}%)`
                      : null}
                  </td>
                  <td className="text-nowrap">{result.sccValue}</td>
                  <td className="text-nowrap">
                    {result.sccCorrespondenceDescription}
                    {result.sccLevyPercentage
                      ? ` (${result.sccLevyPercentage}%)`
                      : null}
                  </td>
                  <td className="text-nowrap">{result.cryValue}</td>
                  <td className="text-nowrap">
                    {result.cryCorrespondenceDescription}
                    {result.cryLevyPercentage
                      ? ` (${result.cryLevyPercentage}%)`
                      : null}
                  </td>
                  <td className="text-nowrap">{result.ffaValue}</td>
                  <td className="text-nowrap">
                    {result.ffaCorrespondenceDescription}
                    {result.ffaLevyPercentage
                      ? ` (${result.ffaLevyPercentage}%)`
                      : null}
                  </td>
                  <td className="text-nowrap">{result.ihValue}</td>
                  <td className="text-nowrap">
                    {result.ihCorrespondenceDescription}
                    {result.ihLevyPercentage
                      ? ` (${result.ihLevyPercentage}%)`
                      : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <Row className="mt-3 mb-3">
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
      <Modal.Header closeButton>
        <Modal.Title>Dairy Test Result History</Modal.Title>
      </Modal.Header>
      <Modal.Body>{control}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
      </Modal.Footer>
    </>
  );
}

DairyTestHistoryModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  licenceId: PropTypes.number.isRequired,
};
