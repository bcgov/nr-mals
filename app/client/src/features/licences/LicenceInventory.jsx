import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";
import { Alert, Container, Form, Row, Col, Button } from "react-bootstrap";

import CustomDatePicker from "../../components/CustomDatePicker";
import { parseAsDate, parseAsInt, parseAsFloat } from "../../utilities/parsing";

import SectionHeading from "../../components/SectionHeading";
import {
  fetchLicenceSpecies,
  selectLicenceSpecies,
} from "../lookups/licenceSpeciesSlice";

import { selectCurrentLicence, updateLicenceInventory } from "./licencesSlice";
import Species from "../lookups/Species";
import SubSpecies from "../lookups/SubSpecies";

import {
  REQUEST_STATUS,
  SPECIES_SUBCODES,
  SYSTEM_ROLES,
} from "../../utilities/constants";
import { formatDate } from "../../utilities/formatting.ts";

import { selectCurrentUser } from "../../app/appSlice";

export default function LicenceInventory({ licence }) {
  const dispatch = useDispatch();
  const currentLicence = useSelector(selectCurrentLicence);
  const currentUser = useSelector(selectCurrentUser);

  const licenceSpecies = useSelector(selectLicenceSpecies);

  const initialInventory = [];
  const [inventory, setInventory] = useState([]);

  const submitting = currentLicence.status === REQUEST_STATUS.PENDING;

  const submissionLabel = submitting ? "Saving..." : "Save";

  const form = useForm({
    reValidateMode: "onBlur",
  });

  const { handleSubmit, setValue, getValues, register } = form;

  useEffect(() => {
    dispatch(fetchLicenceSpecies());

    // Set initial dates in form because DatePicker doesnt do this
    initialInventory.forEach((x, index) => {
      setValue(`inventoryDates[${index}].date`, parseAsDate(x.date));
    });
  }, [dispatch]);

  const calculateInventoryTotal = () => {
    // Total = Most Recent Year Value for MALE + Most Recent Year Value for FEMALE
    let total = 0;

    if (licenceSpecies.status === REQUEST_STATUS.FULFILLED) {
      // eslint-disable-next-line
      const recentYear = Math.max.apply(
        Math,
        // eslint-disable-next-line
        inventory.map(function (o, index) {
          return getValues(`inventoryDates[${index}].date`).getFullYear();
        })
      );

      inventory.forEach((x, index) => {
        const year = getValues(`inventoryDates[${index}].date`).getFullYear();
        const value = getValues(`inventory[${index}].value`);
        const parsed = parseAsInt(value);

        if (year === recentYear) {
          const MALE_ID = licenceSpecies.data.subSpecies.find(
            (sp) =>
              sp.codeName === SPECIES_SUBCODES.MALE &&
              sp.speciesCodeId === x.speciesCodeId
          )?.id;
          const FEMALE_ID = licenceSpecies.data.subSpecies.find(
            (sp) =>
              sp.codeName === SPECIES_SUBCODES.FEMALE &&
              sp.speciesCodeId === x.speciesCodeId
          )?.id;
          const CALVES_ID = licenceSpecies.data.subSpecies.find(
            (sp) =>
              sp.codeName === SPECIES_SUBCODES.CALVES &&
              sp.speciesCodeId === x.speciesCodeId
          )?.id;

          if (
            x.speciesSubCodeId === MALE_ID ||
            x.speciesSubCodeId === FEMALE_ID ||
            x.speciesSubCodeId === CALVES_ID
          ) {
            total += parsed;
          }
        }
      });
    }

    setValue("inventoryTotalValue", total);
    setValue("inventoryTotalValueDisplay", total);

    return total;
  };

  useEffect(() => {
    calculateInventoryTotal();
  }, [inventory]);

  function addInventoryOnClick() {
    const speciesData = licenceSpecies;
    const obj = {
      id: -1,
      speciesCodeId: licence.data.speciesCodeId,
      speciesSubCodeId: speciesData.data.subSpecies.find(
        (x) =>
          x.speciesCodeId === licence.data.speciesCodeId &&
          x.codeName === SPECIES_SUBCODES.MALE
      ).id,
      date: formatDate(new Date(new Date().getFullYear() - 1, 11, 31)),
      value: null,
    };

    // Set default values to override anything that may have been deleted
    setValue(`inventory[${inventory.length}].speciesCodeId`, obj.speciesCodeId);
    setValue(`inventoryDates[${inventory.length}].date`, parseAsDate(obj.date));
    setValue(
      `inventory[${inventory.length}].speciesSubCodeId`,
      obj.speciesSubCodeId
    );
    setValue(`inventory[${inventory.length}].value`, obj.value);

    setInventory([...inventory, obj]);
  }

  function resetInventoryOnClick() {
    setInventory(initialInventory);
  }

  function deleteRow(index) {
    // Shift all the form values
    for (let i = index; i < inventory.length - 1; i += 1) {
      setValue(`inventory[${i}]`, inventory[i + 1]);
    }

    const clone = [...inventory];
    clone.splice(index, 1);
    setInventory([...clone]);
  }

  const onSubmit = (data) => {
    // Just make this array if it doesnt exist
    if (data.inventoryDates === undefined) {
      data.inventoryDates = [];
    }

    const formattedRows = data.inventory.map((inv, index) => {
      return {
        ...inv,
        ...(data.inventoryDates[index] ?? { date: inventory[index].date }),
        value: parseAsFloat(inv.value),
      };
    });

    const payload = {
      inventory: formattedRows,
      totalValue: parseAsInt(data.inventoryTotalValue),
    };

    dispatch(
      updateLicenceInventory({ inventory: payload, id: licence.data.id })
    ).then(() => {
      resetInventoryOnClick();
    });
  };

  const handleSubSpeciesChange = (field, index, value) => {
    const clone = [...inventory];
    const item = { ...inventory[index] };
    item.speciesSubCodeId = parseAsInt(value);
    clone[index] = item;
    setInventory([...clone]);

    setValue(field, value);
  };

  const handleValueChange = (index, value) => {
    const clone = [...inventory];
    const item = { ...inventory[index] };
    item.value = parseAsInt(value);
    clone[index] = item;
    setInventory([...clone]);
  };

  const handleFieldChange = (field, index) => {
    return (value) => {
      const clone = [...inventory];
      const item = { ...inventory[index] };
      item.date = formatDate(value);
      clone[index] = item;
      setInventory([...clone]);

      setValue(field, value);
    };
  };

  return (
    <>
      <SectionHeading>Inventory</SectionHeading>
      <Container className="mt-3 mb-4">
        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Row className="mb-3">
            <Col className="font-weight-bold">Species</Col>
            <Col className="font-weight-bold">Date</Col>
            <Col className="font-weight-bold">Code</Col>
            <Col className="font-weight-bold">Value</Col>
            <Col />
          </Row>
          {inventory.map((x, index) => {
            return (
              <Row key={index}>
                <input
                  type="hidden"
                  id={`inventory[${index}].id`}
                  name={`inventory[${index}].id`}
                  value={x.id}
                  ref={register}
                />
                <Col>
                  <Species
                    species={licenceSpecies}
                    name={`inventory[${index}].speciesCodeId`}
                    defaultValue={x.speciesCodeId}
                    ref={register}
                    readOnly
                  />
                </Col>
                <Col>
                  <Form.Group controlId={`inventoryDates[${index}].date`}>
                    <CustomDatePicker
                      id={`inventoryDates[${index}].date`}
                      notifyOnChange={handleFieldChange(
                        `inventoryDates[${index}].date`,
                        index
                      )}
                      defaultValue={parseAsDate(x.date)}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <SubSpecies
                    subspecies={licenceSpecies}
                    speciesId={x.speciesCodeId}
                    name={`inventory[${index}].speciesSubCodeId`}
                    value={x.speciesSubCodeId}
                    ref={register}
                    onChange={(e) =>
                      handleSubSpeciesChange(
                        `inventory[${index}].speciesSubCodeId`,
                        index,
                        e.target.value
                      )
                    }
                  />
                </Col>
                <Col>
                  <Form.Group controlId={`inventory[${index}].value`}>
                    <Form.Control
                      type="text"
                      name={`inventory[${index}].value`}
                      defaultValue={x.value}
                      ref={register}
                      onChange={(e) => handleValueChange(index, e.target.value)}
                      onBlur={calculateInventoryTotal}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Button variant="link" onClick={() => deleteRow(index)}>
                    Delete
                  </Button>
                </Col>
              </Row>
            );
          })}
          {inventory.length > 0 ? (
            <Row className="mb-3">
              <Col />
              <Col />
              <Col>
                <span className="float-right font-weight-bold">Total</span>
              </Col>
              <Col>
                <input
                  type="hidden"
                  id="inventoryTotalValue"
                  name="inventoryTotalValue"
                  value={0}
                  ref={register}
                />
                <Form.Group controlId="inventoryTotalValueDisplay">
                  <Form.Control
                    type="number"
                    name="inventoryTotalValueDisplay"
                    defaultValue={null}
                    ref={register}
                    disabled
                  />
                </Form.Group>
              </Col>
              <Col />
            </Row>
          ) : null}
          <Row>
            <Col lg={2}>
              <Button
                size="md"
                type="button"
                variant="secondary"
                onClick={addInventoryOnClick}
                disabled={
                  submitting ||
                  licence.data.speciesCodeId === null ||
                  currentUser.data.roleId === SYSTEM_ROLES.READ_ONLY ||
                  currentUser.data.roleId === SYSTEM_ROLES.INSPECTOR
                }
                block
              >
                Add Inventory
              </Button>
            </Col>
            <Col lg={6} />
            <Col lg={2}>
              <Button
                size="md"
                type="button"
                variant="secondary"
                onClick={resetInventoryOnClick}
                disabled={
                  submitting ||
                  currentUser.data.roleId === SYSTEM_ROLES.READ_ONLY ||
                  currentUser.data.roleId === SYSTEM_ROLES.INSPECTOR
                }
                block
              >
                Reset
              </Button>
            </Col>
            <Col lg={2}>
              <Button
                size="md"
                type="submit"
                variant="primary"
                disabled={
                  submitting ||
                  inventory.length === 0 ||
                  currentUser.data.roleId === SYSTEM_ROLES.READ_ONLY ||
                  currentUser.data.roleId === SYSTEM_ROLES.INSPECTOR
                }
                block
              >
                {submissionLabel}
              </Button>
            </Col>
          </Row>
        </Form>
        {currentLicence.status === REQUEST_STATUS.REJECTED ? (
          <Alert variant="danger">
            <Alert.Heading>
              An error was encountered while updating the licence.
            </Alert.Heading>
            <p>
              {currentLicence.error.code}: {currentLicence.error.description}
            </p>
          </Alert>
        ) : null}
      </Container>
    </>
  );
}

LicenceInventory.propTypes = {
  licence: PropTypes.object.isRequired,
};
