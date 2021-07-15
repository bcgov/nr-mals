import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spinner, Table, Row, Col, Button } from "react-bootstrap";

import SectionHeading from "../../components/SectionHeading";
import ErrorMessageRow from "../../components/ErrorMessageRow";

import {
  fetchLicenceSpecies,
  // updateLicenceSpecies,
  selectLicenceSpecies,
} from "../lookups/licenceSpeciesSlice";

import { REQUEST_STATUS } from "../../utilities/constants";

import {
  LICENCE_TYPE_ID_GAME_FARM,
  LICENCE_TYPE_ID_FUR_FARM,
} from "../licences/constants";

import { openModal } from "../../app/appSlice";
import { LICENCE_TYPE } from "../../modals/LicenceTypeModal";

export default function AdminManageFurSpecies() {
  const species = useSelector(selectLicenceSpecies);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchLicenceSpecies());
  }, [dispatch]);

  const editCallback = (data) => {
    // dispatch(updateLicenceSpecies({ payload: data, id: data.id }));
  };

  function onEdit(result) {
    dispatch(
      openModal(LICENCE_TYPE, editCallback, { licenceType: result }, "md")
    );
  }

  function formatResultRow(result, showOptions = true) {
    return (
      <tr key={result.id}>
        <td className="text-nowrap" />
        <td className="text-nowrap" />
        {showOptions ? (
          <>
            <td className="text-nowrap">
              <Button variant="link" onClick={async () => onEdit(result)}>
                Edit
              </Button>
            </td>
          </>
        ) : null}
      </tr>
    );
  }

  let errorMessage = null;
  if (species.status === REQUEST_STATUS.REJECTED) {
    errorMessage = `${species.error.code}: ${species.error.description}`;
  }

  return (
    <>
      <SectionHeading>Manage Fur Species</SectionHeading>

      <Table striped size="sm" responsive className="mt-3" hover>
        <thead className="thead-dark">
          <tr>
            <th className="text-nowrap">Species Name</th>
            <th className="text-nowrap">Species Description</th>
            <th className="text-nowrap" />
          </tr>
        </thead>
        {species.status === REQUEST_STATUS.FULFILLED ? (
          <tbody>{species.data.species.map((x) => formatResultRow(x))}</tbody>
        ) : null}
      </Table>
      {species.status === REQUEST_STATUS.PENDING ? (
        <Spinner animation="border" role="status">
          <span className="sr-only">Searching...</span>
        </Spinner>
      ) : null}
      <div className="mt-3">
        <ErrorMessageRow errorMessage={errorMessage} />
      </div>
    </>
  );
}

AdminManageFurSpecies.propTypes = {};
