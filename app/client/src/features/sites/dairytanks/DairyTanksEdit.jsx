import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Button, Tab } from "react-bootstrap";

import {
  DAIRY_TANK_MODE,
  DAIRY_TANK_STATUS,
} from "../../../utilities/constants";

import DairyTankDetailsEdit from "./DairyTankDetailsEdit";

function useDairyTankController(
  dairyTanks,
  setDairyTanks,
  setSelectedDairyTank,
  clearErrors
) {
  function addDairyTank() {
    const dairyTankKey = dairyTanks.length;
    setDairyTanks([
      ...dairyTanks,
      {
        key: dairyTankKey,
        status: DAIRY_TANK_STATUS.NEW,
      },
    ]);
    setSelectedDairyTank(dairyTankKey);
    clearErrors("noDairyTanks");
  }

  function removeDairyTank(key) {
    const activeDairyTanks = dairyTanks.filter(
      (r) =>
        r.status === DAIRY_TANK_STATUS.EXISTING ||
        r.status === DAIRY_TANK_STATUS.NEW
    );

    // prevent removing the last active dairyTank
    if (activeDairyTanks.length === 1) {
      return;
    }

    // locate the dairyTank
    const index = dairyTanks.findIndex((r) => r.key === key);
    const dairyTank = { ...dairyTanks[index] };

    // determine which dairyTank to display after this one is removed
    const activeIndex = activeDairyTanks.findIndex((r) => r.key === key);
    let nextActiveIndex = activeIndex + 1;
    if (nextActiveIndex >= activeDairyTanks.length) {
      nextActiveIndex = activeIndex - 1;
    }

    // change the status of this dairyTank as appropriate
    if (dairyTank.status === DAIRY_TANK_STATUS.EXISTING) {
      dairyTank.status = DAIRY_TANK_STATUS.DELETED;
    } else if (dairyTank.status === DAIRY_TANK_STATUS.NEW) {
      dairyTank.status = DAIRY_TANK_STATUS.CANCELLED;
    }

    clearErrors(`dairyTanks[${index}]`);

    // update the dairyTanks collection
    const updatedDairyTanks = [...dairyTanks];
    updatedDairyTanks[index] = dairyTank;
    setDairyTanks(updatedDairyTanks);

    // display the next dairyTank or add a new dairyTank if this was the last one
    if (activeDairyTanks.length > 1) {
      setSelectedDairyTank(activeDairyTanks[nextActiveIndex].key);
    } else {
      addDairyTank();
    }
  }

  return { addDairyTank, removeDairyTank };
}

export default function DairyTanksEdit({
  form,
  mode,
  dairyTanks,
  setDairyTanks,
  setSelectedDairyTank,
}) {
  const { clearErrors } = form;
  const { addDairyTank, removeDairyTank } = useDairyTankController(
    dairyTanks,
    setDairyTanks,
    setSelectedDairyTank,
    clearErrors
  );

  useEffect(() => {
    if (dairyTanks.length === 0 && mode === DAIRY_TANK_MODE.CREATE) {
      setDairyTanks([
        {
          key: 0,
          status: DAIRY_TANK_STATUS.NEW,
        },
      ]);
    }
  }, [mode, dairyTanks, setDairyTanks]);

  const activeDairyTanks = dairyTanks.filter(
    (r) =>
      r.status === DAIRY_TANK_STATUS.EXISTING ||
      r.status === DAIRY_TANK_STATUS.NEW
  );

  return (
    <>
      {dairyTanks.map((dairyTank) => {
        const hidden =
          dairyTank.status === DAIRY_TANK_STATUS.DELETED ||
          dairyTank.status === DAIRY_TANK_STATUS.CANCELLED;
        return (
          <Tab.Pane
            key={dairyTank.key}
            eventKey={dairyTank.key}
            className={`${hidden ? "d-none" : null}`}
          >
            <DairyTankDetailsEdit dairyTank={dairyTank} form={form} />
            <Button
              onClick={() => removeDairyTank(dairyTank.key)}
              variant="danger"
              className="mt-3 mb-3"
              disabled={activeDairyTanks.length === 1}
            >
              Remove DairyTank
            </Button>
          </Tab.Pane>
        );
      })}
      <Button onClick={addDairyTank}>Add Dairy Tank</Button>
    </>
  );
}

DairyTanksEdit.propTypes = {
  form: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  dairyTanks: PropTypes.arrayOf(PropTypes.object).isRequired,
  setDairyTanks: PropTypes.func.isRequired,
  setSelectedDairyTank: PropTypes.func.isRequired,
};
