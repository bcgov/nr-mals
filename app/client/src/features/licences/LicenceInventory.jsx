import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  Alert,
  Container,
  Form,
  Spinner,
  Table,
  Row,
  Col,
  Button,
  ButtonGroup,
} from "react-bootstrap";

import CustomDatePicker from "../../components/CustomDatePicker";
import { parseAsDate } from "../../utilities/parsing";

import SectionHeading from "../../components/SectionHeading";
import {
  fetchGameFarmSpecies,
  selectGameFarmSpecies,
} from "../lookups/gameFarmSlice";
import {
  fetchFurFarmSpecies,
  selectFurFarmSpecies,
} from "../lookups/furFarmSlice";
import {
  selectCurrentLicence,
  updateLicenceInventory,
} from "../licences/licencesSlice";
import Species from "../lookups/Species";
import SubSpecies from "../lookups/SubSpecies";

import {
  REQUEST_STATUS,
  GAME_FARM_SPECIES_SUBCODES,
} from "../../utilities/constants";
import { formatDate, formatDateString } from "../../utilities/formatting";

import {
  LICENCE_TYPE_ID_GAME_FARM,
  LICENCE_TYPE_ID_FUR_FARM,
} from "../licences/constants";

export default function LicenceInventory({ licence }) {
  const dispatch = useDispatch();
  const currentLicence = useSelector(selectCurrentLicence);

  const gameFarmSpecies = useSelector(selectGameFarmSpecies);
  const furFarmSpecies = useSelector(selectFurFarmSpecies);

  const [initialInventory, setInitialInventory] = useState([]);
  const [inventory, setInventory] = useState([]);

  const submitting = currentLicence.status === REQUEST_STATUS.PENDING;

  const submissionLabel = submitting ? "Saving..." : "Save";

  const form = useForm({
    reValidateMode: "onBlur",
  });

  const {
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    getValues,
    watch,
    register,
  } = form;

  useEffect(() => {
    switch (licence.data.licenceTypeId) {
      case LICENCE_TYPE_ID_GAME_FARM:
        dispatch(fetchGameFarmSpecies());
        break;
      case LICENCE_TYPE_ID_FUR_FARM:
        dispatch(fetchFurFarmSpecies());
        break;
      default:
        break;
    }

    // Set initial dates in form because DatePicker doesnt do this
    initialInventory.map((x, index) => {
      setValue(`inventoryDates[${index}].date`, parseAsDate(x.date));
    });
  }, [dispatch]);

  useEffect(() => {
    calculateInventoryTotal();
  }, [inventory]);

  function getSpeciesData() {
    switch (licence.data.licenceTypeId) {
      case LICENCE_TYPE_ID_GAME_FARM:
        return gameFarmSpecies;
      case LICENCE_TYPE_ID_FUR_FARM:
        return furFarmSpecies;
      default:
        return null;
    }
  }

  function addInventoryOnClick() {
    let obj = {
      id: -1,
      speciesCodeId: getSpeciesData().data.species[0].id,
      speciesSubCodeId: getSpeciesData().data.subSpecies[0].id,
      date: formatDate(new Date()),
      value: null,
    };

    // Required to set the initial form row date value
    setValue(`inventoryDates[${inventory.length}].date`, parseAsDate(obj.date));

    setInventory([...inventory, obj]);
  }

  function resetInventoryOnClick() {
    setInventory(initialInventory);
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
        value: parseFloat(inv.value),
      };
    });

    const payload = {
      inventory: formattedRows,
      totalValue: parseInt(data.inventoryTotalValue),
    };

    dispatch(
      updateLicenceInventory({ inventory: payload, id: licence.data.id })
    );
  };

  const handleSpeciesChange = (index, value) => {
    let clone = [...inventory];
    let item = { ...inventory[index] };
    item.speciesCodeId = parseInt(value);
    clone[index] = item;
    setInventory([...clone]);
  };

  const handleSubSpeciesChange = (index, value) => {
    let clone = [...inventory];
    let item = { ...inventory[index] };
    item.speciesSubCodeId = parseInt(value);
    clone[index] = item;
    setInventory([...clone]);
  };

  const handleFieldChange = (field) => {
    return (value) => {
      setValue(field, value);
    };
  };

  const calculateInventoryTotal = () => {
    let total = 0;

    if (getSpeciesData().status == REQUEST_STATUS.FULFILLED) {
      //Total = Most Recent Year Value for MALE + Most Recent Year Value for FEMALE

      const recentYear = Math.max.apply(
        Math,
        inventory.map(function (o, index) {
          return getValues(`inventoryDates[${index}].date`).getFullYear();
        })
      );

      inventory.map((x, index) => {
        const year = getValues(`inventoryDates[${index}].date`).getFullYear();
        if (year === recentYear) {
          const MALE_ID = getSpeciesData().data.subSpecies.find(
            (sp) =>
              sp.codeName === GAME_FARM_SPECIES_SUBCODES.MALE &&
              sp.speciesCodeId == x.speciesCodeId
          )?.id;
          const FEMALE_ID = getSpeciesData().data.subSpecies.find(
            (sp) =>
              sp.codeName === GAME_FARM_SPECIES_SUBCODES.FEMALE &&
              sp.speciesCodeId == x.speciesCodeId
          )?.id;

          if (
            x.speciesSubCodeId === MALE_ID ||
            x.speciesSubCodeId === FEMALE_ID
          ) {
            let value = getValues(`inventory[${index}].value`);
            let parsed = parseInt(value);
            value = isNaN(parsed) ? 0 : parsed;
            total += value;
          }
        }
      });
    }

    setValue("inventoryTotalValue", total);
    setValue("inventoryTotalValueDisplay", total);

    return total;
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
                    species={getSpeciesData()}
                    name={`inventory[${index}].speciesCodeId`}
                    defaultValue={x.speciesCodeId}
                    ref={register}
                    onChange={(e) => handleSpeciesChange(index, e.target.value)}
                  />
                </Col>
                <Col>
                  <Form.Group controlId={`inventoryDates[${index}].date`}>
                    <CustomDatePicker
                      id={`inventoryDates[${index}].date`}
                      notifyOnChange={handleFieldChange(
                        `inventoryDates[${index}].date`
                      )}
                      defaultValue={parseAsDate(x.date)}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <SubSpecies
                    subspecies={getSpeciesData()}
                    speciesId={x.speciesCodeId}
                    name={`inventory[${index}].speciesSubCodeId`}
                    defaultValue={x.speciesSubCodeId}
                    ref={register}
                    onChange={(e) =>
                      handleSubSpeciesChange(index, e.target.value)
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
                      onBlur={calculateInventoryTotal}
                    />
                  </Form.Group>
                </Col>
              </Row>
            );
          })}
          <Row className="mb-3">
            <Col lg={2}>
              <Button
                size="md"
                type="button"
                variant="secondary"
                onClick={addInventoryOnClick}
                disabled={submitting}
                block
              >
                Add Inventory
              </Button>
            </Col>
            <Col lg={7}>
              <span className="float-right font-weight-bold">Total</span>
            </Col>
            <Col lg={3}>
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
          </Row>
          <Row>
            <Col lg={8} />
            <Col lg={2}>
              <Button
                size="md"
                type="button"
                variant="secondary"
                onClick={resetInventoryOnClick}
                disabled={submitting}
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
                disabled={submitting}
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
