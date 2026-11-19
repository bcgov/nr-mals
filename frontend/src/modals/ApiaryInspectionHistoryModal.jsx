import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import {
  Alert,
  Spinner,
  Row,
  Col,
  Button,
  ButtonGroup,
  Modal,
} from "react-bootstrap";

import { REQUEST_STATUS } from "../utilities/constants";

import {
  fetchApiaryInspectionHistory,
  selectApiaryInspectionHistory,
} from "../features/inspections/inspectionsSlice";
import ApiaryInspectionTable from "../features/inspections/ApiaryInspectionTable";

export const APIARY_INSPECTION_HISTORY = "APIARY_INSPECTION_HISTORY";

const PAGE_SIZE = 20;

export default function ApiaryInspectionHistoryModal({
  licenceId,
  closeModal,
}) {
  const history = useSelector(selectApiaryInspectionHistory);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchApiaryInspectionHistory({ licenceId, page: 1 }));
  }, [dispatch, licenceId]);

  const goToPage = (page) =>
    dispatch(fetchApiaryInspectionHistory({ licenceId, page }));

  const { status, data, error } = history;

  let control = null;
  if (status === REQUEST_STATUS.PENDING) {
    control = (
      <Spinner animation="border" role="status">
        <span className="sr-only">Searching...</span>
      </Spinner>
    );
  } else if (status === REQUEST_STATUS.REJECTED) {
    control = (
      <Alert variant="danger">
        <Alert.Heading>
          An error was encountered while retrieving results.
        </Alert.Heading>
        <p>
          {error.code}: {error.description}
        </p>
      </Alert>
    );
  } else if (status === REQUEST_STATUS.FULFILLED && data.count === 0) {
    control = (
      <Alert variant="success" className="mt-3">
        <div>There are no inspections for this licence.</div>
      </Alert>
    );
  } else if (status === REQUEST_STATUS.FULFILLED) {
    control = (
      <>
        <ApiaryInspectionTable
          inspections={data.results}
          onNavigate={closeModal}
        />
        <Row className="mt-3 mb-3">
          <Col md="3" />
          <Col className="d-flex justify-content-center">
            Showing {data.results.length} of {data.count} entries
          </Col>
          <Col md="auto">
            <ButtonGroup>
              <Button
                disabled={data.page < 2}
                onClick={() => goToPage(data.page - 1)}
              >
                Previous
              </Button>
              <Button disabled>{data.page}</Button>
              <Button
                disabled={data.page * PAGE_SIZE >= data.count}
                onClick={() => goToPage(data.page + 1)}
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
        <Modal.Title>Apiary Inspection History</Modal.Title>
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

ApiaryInspectionHistoryModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  licenceId: PropTypes.number.isRequired,
};
