import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { ErrorMessage } from "@hookform/error-message";
import { Card, Nav, Tab, Alert } from "react-bootstrap";

import {
  DAIRY_TANK_MODE,
  DAIRY_TANK_STATUS,
} from "../../../utilities/constants";

import DairyTanksEdit from "./DairyTanksEdit";
import DairyTanksView from "./DairyTanksView";

export default function DairyTanksTab({ initialDairyTanks, mode, form }) {
  let errors;
  if (form) {
    errors = form.errors;
  }

  const siteId = useParams().id;
  const [dairyTanks, setDairyTanks] = useState([...initialDairyTanks]);
  const [selectedTabKey, setSelectedTabKey] = useState(
    sessionStorage.getItem("siteId") === siteId
      ? sessionStorage.getItem("selectedTabKey")
      : 0
  );

  useEffect(() => {
    sessionStorage.setItem("siteId", siteId);
    sessionStorage.setItem("selectedTabKey", selectedTabKey);
  }, [selectedTabKey, siteId]);

  let dairyTankOutput;
  switch (mode) {
    case DAIRY_TANK_MODE.VIEW:
      dairyTankOutput = <DairyTanksView dairyTanks={dairyTanks} />;
      break;
    case DAIRY_TANK_MODE.CREATE:
    case DAIRY_TANK_MODE.EDIT:
      dairyTankOutput = (
        <DairyTanksEdit
          form={form}
          mode={mode}
          dairyTanks={dairyTanks}
          setDairyTanks={setDairyTanks}
          setSelectedDairyTank={setSelectedTabKey}
        />
      );
      break;
    default:
      return <></>;
  }

  const activeDairyTanks = dairyTanks.filter(
    (r) =>
      r.status === DAIRY_TANK_STATUS.EXISTING ||
      r.status === DAIRY_TANK_STATUS.NEW
  );

  let cardHeader = <></>;
  if (activeDairyTanks.length > 0) {
    cardHeader = (
      <Card.Header>
        <Nav variant="pills">
          {activeDairyTanks.map((dairyTank, index) => {
            const dairyTankErrors =
              errors && errors.dairyTanks
                ? errors.dairyTanks[dairyTank.key]
                : undefined;
            let className;
            if (dairyTankErrors) {
              if (dairyTank.key === selectedTabKey) {
                className = "bg-danger";
              } else {
                className = "text-danger";
              }
            }

            return (
              <Nav.Item key={dairyTank.key}>
                <Nav.Link
                  className={className}
                  eventKey={dairyTank.key}
                  onClick={() => setSelectedTabKey(dairyTank.key)}
                >
                  {`Tank #${index + 1}`}
                </Nav.Link>
              </Nav.Item>
            );
          })}
        </Nav>
      </Card.Header>
    );
  }

  return (
    <>
      <Tab.Container
        id="dairyTank-tabs"
        activeKey={selectedTabKey}
        transition={false}
      >
        <Card className="mb-3">
          {cardHeader}
          <Card.Body>
            <Tab.Content>{dairyTankOutput}</Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
      {errors && (
        <ErrorMessage
          errors={errors}
          name="noDairyTanks"
          render={({ message }) => (
            <Alert variant="danger" className="mt-3">
              {message}
            </Alert>
          )}
        />
      )}
    </>
  );
}

DairyTanksTab.propTypes = {
  initialDairyTanks: PropTypes.arrayOf(PropTypes.object),
  mode: PropTypes.string.isRequired,
  form: PropTypes.object,
};

DairyTanksTab.defaultProps = {
  initialDairyTanks: [],
  form: null,
};
