/* eslint-disable no-use-before-define */
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spinner, Table, Button } from "react-bootstrap";

import SectionHeading from "../../components/SectionHeading";
import ErrorMessageRow from "../../components/ErrorMessageRow";

import {
  fetchDairyFarmTestThresholds,
  updateDairyFarmTestThresholds,
  selectDairyFarmTestThresholds,
} from "../lookups/dairyFarmTestThresholdSlice";

import { REQUEST_STATUS } from "../../utilities/constants";

import { openModal } from "../../app/appSlice";
import { THRESHOLD } from "../../modals/DairyFarmTestThresholdsModal";

export default function AdminManageDairyTestValues() {
  const dairyFarmTestThresholds = useSelector(selectDairyFarmTestThresholds);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchDairyFarmTestThresholds());
  }, [dispatch]);

  const editThresholdCallback = (data) => {
    dispatch(updateDairyFarmTestThresholds({ payload: data, id: data.id }));
  };

  function formatResultRow(result, showOptions = true) {
    return (
      <tr key={result.id}>
        <td className="text-nowrap">{result.speciesCode}</td>
        <td className="text-nowrap">{result.speciesSubCode}</td>
        <td className="text-nowrap">{result.upperLimit}</td>
        {showOptions ? (
          <>
            <td className="text-nowrap">
              <Button
                variant="link"
                onClick={async () => onEditThreshold(result)}
              >
                Edit
              </Button>
            </td>
          </>
        ) : null}
      </tr>
    );
  }

  function onEditThreshold(result) {
    dispatch(
      openModal(THRESHOLD, editThresholdCallback, { threshold: result }, "md")
    );
  }

  let errorMessage = null;
  if (dairyFarmTestThresholds.status === REQUEST_STATUS.REJECTED) {
    errorMessage = `${dairyFarmTestThresholds.error.code}: ${dairyFarmTestThresholds.error.description}`;
  }

  return (
    <>
      <SectionHeading>Manage Dairy Test Values</SectionHeading>

      <Table striped size="sm" responsive className="mt-3" hover>
        <thead className="thead-dark">
          <tr>
            <th className="text-nowrap">Species</th>
            <th className="text-nowrap">Subspecies</th>
            <th className="text-nowrap">Threshold</th>
            <th className="text-nowrap" />
          </tr>
        </thead>
        {dairyFarmTestThresholds.status === REQUEST_STATUS.FULFILLED ? (
          <tbody>
            {dairyFarmTestThresholds.data.map((user) => formatResultRow(user))}
          </tbody>
        ) : null}
      </Table>
      {dairyFarmTestThresholds.status === REQUEST_STATUS.PENDING ? (
        <Spinner animation="border" role="status">
          <span className="sr-only">Searching...</span>
        </Spinner>
      ) : null}
      <ErrorMessageRow errorMessage={errorMessage} />
    </>
  );
}

AdminManageDairyTestValues.propTypes = {};
