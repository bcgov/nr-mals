import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { ErrorMessage } from "@hookform/error-message";
import { Card, Nav, Tab, Alert } from "react-bootstrap";

import { REGISTRANT_MODE, REGISTRANT_STATUS } from "../../utilities/constants";

import RegistrantsEdit from "./RegistrantsEdit";
import RegistrantsView from "./RegistrantsView";

export default function RegistrantsTab({
  initialRegistrants,
  mode,
  form,
  submitting,
}) {
  let errors;
  if (form) {
    errors = form.errors;
  }

  const licenceId = useParams().id;
  const [registrants, setRegistrants] = useState([...initialRegistrants]);
  const [selectedTabKey, setSelectedTabKey] = useState(
    sessionStorage.getItem("licenceId") === licenceId
      ? sessionStorage.getItem("selectedTabKey")
      : 0
  );

  useEffect(() => {
    sessionStorage.setItem("licenceId", licenceId);
    sessionStorage.setItem("selectedTabKey", selectedTabKey);
  }, [selectedTabKey, licenceId]);

  let registrantOutput;
  switch (mode) {
    case REGISTRANT_MODE.VIEW:
      registrantOutput = <RegistrantsView registrants={registrants} />;
      break;
    case REGISTRANT_MODE.CREATE:
    case REGISTRANT_MODE.EDIT:
      registrantOutput = (
        <RegistrantsEdit
          form={form}
          mode={mode}
          registrants={registrants}
          setRegistrants={setRegistrants}
          setSelectedRegistrant={setSelectedTabKey}
          submitting={submitting}
        />
      );
      break;
    default:
      return <></>;
  }

  const activeRegistrants = registrants.filter(
    (r) =>
      r.status === REGISTRANT_STATUS.EXISTING ||
      r.status === REGISTRANT_STATUS.NEW
  );

  let cardHeader = <></>;
  if (activeRegistrants.length > 0) {
    cardHeader = (
      <Card.Header>
        <Nav variant="pills">
          {activeRegistrants.map((registrant, index) => {
            const registrantErrors =
              errors && errors.registrants
                ? errors.registrants[registrant.key]
                : undefined;
            let className;
            if (registrantErrors) {
              if (registrant.key === selectedTabKey) {
                className = "bg-danger";
              } else {
                className = "text-danger";
              }
            }

            return (
              <Nav.Item key={registrant.key}>
                <Nav.Link
                  className={className}
                  eventKey={registrant.key}
                  onClick={() => setSelectedTabKey(registrant.key)}
                >
                  {registrant.status === REGISTRANT_STATUS.EXISTING
                    ? registrant.label
                    : `Registrant #${index + 1}`}
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
        id="registrant-tabs"
        activeKey={selectedTabKey}
        transition={false}
      >
        <Card className="mb-3">
          {cardHeader}
          <Card.Body>
            <Tab.Content>{registrantOutput}</Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
      {errors && (
        <ErrorMessage
          errors={errors}
          name="noRegistrants"
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

RegistrantsTab.propTypes = {
  initialRegistrants: PropTypes.arrayOf(PropTypes.object),
  mode: PropTypes.string.isRequired,
  form: PropTypes.object,
  submitting: PropTypes.bool,
};

RegistrantsTab.defaultProps = {
  initialRegistrants: [],
  form: null,
  submitting: false,
};
