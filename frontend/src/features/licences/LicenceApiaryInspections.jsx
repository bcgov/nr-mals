import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import { Container, Form, Row, Col, Button, Spinner } from "react-bootstrap";

import SectionHeading from "../../components/SectionHeading";
import ErrorMessageRow from "../../components/ErrorMessageRow";

import {
  REQUEST_STATUS,
  SYSTEM_ROLES,
  CREATE_INSPECTIONS_PATHNAME,
} from "../../utilities/constants";
import { parseAsInt } from "../../utilities/parsing";

import { openModal, selectCurrentUser } from "../../app/appSlice";
import { APIARY_INSPECTION_HISTORY } from "../../modals/ApiaryInspectionHistoryModal";
import {
  fetchLicenceApiaryInspections,
  selectLicenceApiaryInspections,
} from "../inspections/inspectionsSlice";
import ApiaryInspectionTable from "../inspections/ApiaryInspectionTable";

// MALS2-124 - Licence-level view of apiary inspections across all of the licence's sites.
// Shows the most recent inspection, with View History for the rest.
export default function LicenceApiaryInspections({ licence }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const inspections = useSelector(selectLicenceApiaryInspections);
  const currentUser = useSelector(selectCurrentUser);

  const licenceId = licence.data.id;
  const [selectedSiteId, setSelectedSiteId] = useState("");

  useEffect(() => {
    dispatch(fetchLicenceApiaryInspections(licenceId));
  }, [dispatch, licenceId]);

  const { status, data, error } = inspections;
  const sites = data?.sites ?? [];
  const latest = data?.results?.[0];
  const canAdd = currentUser.data?.roleId !== SYSTEM_ROLES.READ_ONLY;

  // Default the site picker to the first site once sites have loaded
  useEffect(() => {
    if (
      sites.length > 0 &&
      !sites.some((s) => s.id === parseAsInt(selectedSiteId))
    ) {
      setSelectedSiteId(String(sites[0].id));
    }
  }, [sites, selectedSiteId]);

  const openHistory = () => {
    dispatch(openModal(APIARY_INSPECTION_HISTORY, null, { licenceId }, "xl"));
  };

  const addInspection = () => {
    history.push({
      pathname: `${CREATE_INSPECTIONS_PATHNAME}/${selectedSiteId}`,
      state: { returnToLicenceId: licenceId },
    });
  };

  let content;
  if (status === REQUEST_STATUS.PENDING || status === REQUEST_STATUS.IDLE) {
    content = (
      <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
    );
  } else if (status === REQUEST_STATUS.REJECTED) {
    content = (
      <ErrorMessageRow
        errorHeading="An error was encountered while retrieving inspections."
        errorMessage={`${error.code}: ${error.description}`}
      />
    );
  } else if (latest === undefined) {
    content = (
      <ErrorMessageRow
        variant="success"
        errorHeading={null}
        errorMessage="There are no inspections associated with this licence."
      />
    );
  } else {
    content = <ApiaryInspectionTable inspections={[latest]} />;
  }

  return (
    <section>
      <SectionHeading>Inspection Details</SectionHeading>
      <Container className="mt-3 mb-4">
        {content}
        <Row className="mt-3">
          <Col lg={2}>
            <Button
              size="md"
              type="button"
              variant="secondary"
              onClick={openHistory}
              disabled={status !== REQUEST_STATUS.FULFILLED || !latest}
              block
            >
              View History
            </Button>
          </Col>
          {canAdd ? (
            <>
              <Col lg={2}>
                <Form.Control
                  as="select"
                  aria-label="Apiary Site ID for new inspection"
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  disabled={sites.length === 0}
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      Site {s.apiarySiteId ?? `(id ${s.id})`}
                    </option>
                  ))}
                </Form.Control>
              </Col>
              <Col lg={2}>
                <Button
                  size="md"
                  type="button"
                  variant="secondary"
                  onClick={addInspection}
                  disabled={sites.length === 0 || selectedSiteId === ""}
                  block
                >
                  Add Inspection
                </Button>
              </Col>
            </>
          ) : null}
        </Row>
      </Container>
    </section>
  );
}

LicenceApiaryInspections.propTypes = {
  licence: PropTypes.object.isRequired,
};
