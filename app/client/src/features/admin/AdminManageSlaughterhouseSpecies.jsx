import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spinner, Table, Row, Col, Button } from "react-bootstrap";

import SectionHeading from "../../components/SectionHeading";
import ErrorMessageRow from "../../components/ErrorMessageRow";

import {
  fetchSlaughterhouseSpecies,
  createSlaughterhouseSpecies,
  updateSlaughterhouseSpecies,
  selectSlaughterhouseSpecies,
} from "../lookups/slaughterhouseSpeciesSlice";

import { REQUEST_STATUS } from "../../utilities/constants";

import { openModal } from "../../app/appSlice";
import { SLAUGHTERHOUSE_SPECIES_MODAL } from "../../modals/SlaughterhouseSpeciesModal";

export default function AdminManageSlaughterhouseSpecies() {
  const species = useSelector(selectSlaughterhouseSpecies);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSlaughterhouseSpecies());
  }, [dispatch]);

  const addCallback = (data) => {
    dispatch(
      createSlaughterhouseSpecies({
        ...data,
      })
    );
  };

  function onAdd() {
    dispatch(openModal(SLAUGHTERHOUSE_SPECIES_MODAL, addCallback, {}, "md"));
  }

  const editCallback = (data) => {
    dispatch(updateSlaughterhouseSpecies({ payload: data, id: data.id }));
  };

  function onEdit(result) {
    dispatch(
      openModal(
        SLAUGHTERHOUSE_SPECIES_MODAL,
        editCallback,
        { species: result },
        "md"
      )
    );
  }

  function formatResultRow(result, showOptions = true) {
    return (
      <tr key={result.id}>
        <td className="text-nowrap">{result.codeName}</td>
        <td className="text-nowrap">{result.codeDescription}</td>
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
      <SectionHeading>Manage Slaughterhouse Species</SectionHeading>
      <Row className="mt-3 d-flex justify-content-end">
        <Col md="auto">
          <Button
            variant="secondary"
            type="button"
            onClick={async () => onAdd()}
          >
            Add a Slaughterhouse Species
          </Button>
        </Col>
      </Row>
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
      <ErrorMessageRow errorMessage={errorMessage} />
    </>
  );
}

AdminManageSlaughterhouseSpecies.propTypes = {};
