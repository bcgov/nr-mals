import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Button, Tab } from "react-bootstrap";

import { REGISTRANT_MODE, REGISTRANT_STATUS } from "../../utilities/constants";

import RegistrantDetailsEdit from "./RegistrantDetailsEdit";

function useRegistrantController(
  registrants,
  setRegistrants,
  setSelectedRegistrant,
  clearErrors
) {
  function addRegistrant() {
    const registrantKey = registrants.length;
    setRegistrants([
      ...registrants,
      {
        key: registrantKey,
        status: REGISTRANT_STATUS.NEW,
      },
    ]);
    setSelectedRegistrant(registrantKey);
    clearErrors("noRegistrants");
  }

  function removeRegistrant(key) {
    const activeRegistrants = registrants.filter(
      (r) =>
        r.status === REGISTRANT_STATUS.EXISTING ||
        r.status === REGISTRANT_STATUS.NEW
    );

    // prevent removing the last active registrant
    if (activeRegistrants.length === 1) {
      return;
    }

    // locate the registrant
    const index = registrants.findIndex((r) => r.key === key);
    const registrant = { ...registrants[index] };

    // determine which registrant to display after this one is removed
    const activeIndex = activeRegistrants.findIndex((r) => r.key === key);
    let nextActiveIndex = activeIndex + 1;
    if (nextActiveIndex >= activeRegistrants.length) {
      nextActiveIndex = activeIndex - 1;
    }

    // change the status of this registrant as appropriate
    if (registrant.status === REGISTRANT_STATUS.EXISTING) {
      registrant.status = REGISTRANT_STATUS.DELETED;
    } else if (registrant.status === REGISTRANT_STATUS.NEW) {
      registrant.status = REGISTRANT_STATUS.CANCELLED;
    }

    clearErrors(`registrants[${index}]`);

    // update the registrants collection
    const updatedRegistrants = [...registrants];
    updatedRegistrants[index] = registrant;
    setRegistrants(updatedRegistrants);

    // display the next registrant or add a new registrant if this was the last one
    if (activeRegistrants.length > 1) {
      setSelectedRegistrant(activeRegistrants[nextActiveIndex].key);
    } else {
      addRegistrant();
    }
  }

  return { addRegistrant, removeRegistrant };
}

export default function RegistrantsEdit({
  form,
  mode,
  registrants,
  setRegistrants,
  setSelectedRegistrant,
  submitting,
}) {
  const { clearErrors } = form;
  const { addRegistrant, removeRegistrant } = useRegistrantController(
    registrants,
    setRegistrants,
    setSelectedRegistrant,
    clearErrors
  );

  useEffect(() => {
    if (registrants.length === 0 && mode === REGISTRANT_MODE.CREATE) {
      setRegistrants([
        {
          key: 0,
          status: REGISTRANT_STATUS.NEW,
        },
      ]);
    }
  }, [mode, registrants, setRegistrants]);

  const activeRegistrants = registrants.filter(
    (r) =>
      r.status === REGISTRANT_STATUS.EXISTING ||
      r.status === REGISTRANT_STATUS.NEW
  );

  return (
    <>
      {registrants.map((registrant) => {
        const hidden =
          registrant.status === REGISTRANT_STATUS.DELETED ||
          registrant.status === REGISTRANT_STATUS.CANCELLED;
        return (
          <Tab.Pane
            key={registrant.key}
            eventKey={registrant.key}
            className={`${hidden ? "d-none" : null}`}
          >
            <RegistrantDetailsEdit
              registrant={registrant}
              form={form}
              submitting={submitting}
            />
            <Button
              onClick={() => removeRegistrant(registrant.key)}
              variant="danger"
              className="mt-3 mb-3"
              disabled={activeRegistrants.length === 1}
            >
              Remove Registrant
            </Button>
          </Tab.Pane>
        );
      })}
      <Button onClick={addRegistrant}>Add Registrant</Button>
    </>
  );
}

RegistrantsEdit.propTypes = {
  form: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  registrants: PropTypes.arrayOf(PropTypes.object).isRequired,
  setRegistrants: PropTypes.func.isRequired,
  setSelectedRegistrant: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
};
