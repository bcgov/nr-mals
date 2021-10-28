/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";
import { Alert, Container, Form, Row, Col, Button } from "react-bootstrap";

import CustomDatePicker from "../../components/CustomDatePicker";
import { parseAsDate, parseAsInt, parseAsFloat } from "../../utilities/parsing";

import SectionHeading from "../../components/SectionHeading";
import ErrorMessageRow from "../../components/ErrorMessageRow";

import {
  selectDairyTestResults,
  fetchLicenceDairyTestResults,
  updateLicenceDairyTestResults,
  calculateWarningLevyNotice,
} from "./licencesSlice";

import {
  REQUEST_STATUS,
  DAIRY_TEST_THRESHOLD_IDS,
} from "../../utilities/constants";
import { formatDate } from "../../utilities/formatting.ts";

import { openModal } from "../../app/appSlice";
import { DAIRY_TEST_HISTORY_SEARCH } from "../../modals/DairyTestHistoryModal";
import { selectSiteParameters } from "../search/searchSlice";

export default function LicenceDairyTestInventory({ licence }) {
  const dispatch = useDispatch();
  const dairyTestResults = useSelector(selectDairyTestResults);

  const [initialInventory, setInitialInventory] = useState([]);
  const [inventory, setInventory] = useState([]);

  const submitting = dairyTestResults.status === REQUEST_STATUS.PENDING;

  const submissionLabel = submitting ? "Saving..." : "Save";

  const form = useForm({
    reValidateMode: "onBlur",
  });

  const { handleSubmit, setValue, register } = form;

  useEffect(() => {
    dispatch(fetchLicenceDairyTestResults(licence.data.id));
  }, [dispatch]);

  useEffect(() => {
    if (
      dairyTestResults.data === undefined ||
      dairyTestResults.data.length === 0
    ) {
      return;
    }

    const latestResults = dairyTestResults.data;

    const rows = [];
    latestResults.forEach((x) => {
      // scp1/ibc
      rows.push({
        date: x.spc1Date,
        testTypeId: DAIRY_TEST_THRESHOLD_IDS.IBC,
        value: x.spc1Value,
        action: x.spc1CorrespondenceDescription,
        levy: x.spc1LevyPercentage,
      });

      // scc
      rows.push({
        date: x.sccDate,
        testTypeId: DAIRY_TEST_THRESHOLD_IDS.SCC,
        value: x.sccValue,
        action: x.sccCorrespondenceDescription,
        levy: x.sccLevyPercentage,
      });

      // ih
      rows.push({
        date: x.ihDate,
        testTypeId: DAIRY_TEST_THRESHOLD_IDS.IH,
        value: x.ihValue,
        action: x.ihCorrespondenceDescription,
        levy: x.ihLevyPercentage,
      });

      // cry/water
      rows.push({
        date: x.cryDate,
        testTypeId: DAIRY_TEST_THRESHOLD_IDS.WATER,
        value: x.cryValue,
        action: x.cryCorrespondenceDescription,
        levy: x.cryLevyPercentage,
      });
    });

    const filtered = rows.filter((x) => x.date !== null);
    setInitialInventory(filtered);
  }, [dairyTestResults]);

  useEffect(() => {}, [inventory]);

  function addInventoryOnClick() {
    const obj = {
      id: -1,
      date: formatDate(new Date(new Date().getFullYear() - 1, 2, 31)),
      testTypeId: DAIRY_TEST_THRESHOLD_IDS.IH,
      value: undefined,
      action: undefined,
      levy: undefined,

      previousInfractionFirstDate: undefined,
      previousInfractionCount: undefined,
      correspondence: undefined,
    };

    // Set default values to override anything that may have been deleted
    setValue(`inventoryDates[${inventory.length}].date`, parseAsDate(obj.date));
    setValue(`inventory[${inventory.length}].testTypeId`, obj.testTypeId);
    setValue(`inventory[${inventory.length}].value`, obj.value);
    setValue(`inventory[${inventory.length}].action`, obj.action);
    setValue(`inventory[${inventory.length}].levy`, obj.levy);
    setValue(
      `inventory[${inventory.length}].previousInfractionFirstDate`,
      obj.previousInfractionFirstDate
    );
    setValue(
      `inventory[${inventory.length}].previousInfractionCount`,
      obj.previousInfractionCount
    );
    setValue(
      `inventory[${inventory.length}].correspondence`,
      obj.correspondence
    );

    setInventory([...inventory, obj]);
  }

  function resetInventory() {
    setInventory([]);
  }

  function deleteRow(index) {
    // Shift all the form values
    for (let i = index; i < inventory.length - 1; i += 1) {
      setValue(`inventory[${i}]`, inventory[i + 1]);
    }

    setValue(`inventory[${inventory.length}]`, undefined);

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
        ...(data.inventoryDates[index] ?? { date: undefined }),
      };
    });

    // Take original object and add/overwrite new values
    let update = { ...dairyTestResults.data[0] };
    formattedRows.forEach((x) => {
      switch (parseAsInt(x.testTypeId)) {
        case DAIRY_TEST_THRESHOLD_IDS.IBC:
          update.spc1Date = formatDate(x.date);
          update.spc1Value = parseAsFloat(x.value);
          update.spc1PreviousInfractionFirstDate =
            update.previousInfractionFirstDate;
          update.spc1PreviousInfractionCount = parseAsInt(
            update.previousInfractionCount
          );
          update.spc1LevyPercentage = parseAsFloat(update.levy);
          update.spc1CorrespondenceCode = update.correspondence;
          update.spc1CorrespondenceDescription = update.action;
          break;
        case DAIRY_TEST_THRESHOLD_IDS.SCC:
          update.sccDate = formatDate(x.date);
          update.sccValue = parseAsFloat(x.value);
          update.sccPreviousInfractionFirstDate = x.previousInfractionFirstDate;
          update.sccPreviousInfractionCount = parseAsInt(
            x.previousInfractionCount
          );
          update.sccLevyPercentage = parseAsFloat(x.levy);
          update.sccCorrespondenceCode = x.correspondence;
          update.sccCorrespondenceDescription = x.action;
          break;
        case DAIRY_TEST_THRESHOLD_IDS.IH:
          update.ihDate = formatDate(x.date);
          update.ihValue = parseAsFloat(x.value);
          update.ihPreviousInfractionFirstDate = x.previousInfractionFirstDate;
          update.ihPreviousInfractionCount = parseAsInt(
            x.previousInfractionCount
          );
          update.ihLevyPercentage = parseAsFloat(x.levy);
          update.ihCorrespondenceCode = x.correspondence;
          update.ihCorrespondenceDescription = x.action;
          break;
        case DAIRY_TEST_THRESHOLD_IDS.WATER:
          update.cryDate = formatDate(x.date);
          update.cryValue = parseAsFloat(x.value);
          update.cryPreviousInfractionFirstDate = x.previousInfractionFirstDate;
          update.cryPreviousInfractionCount = parseAsInt(
            x.previousInfractionCount
          );
          update.cryLevyPercentage = parseAsFloat(x.levy);
          update.cryCorrespondenceCode = x.correspondence;
          update.cryCorrespondenceDescription = x.action;
          break;
      }
    });

    const payload = {
      ...update,
      licenceId: licence.data.id,
    };

    dispatch(
      updateLicenceDairyTestResults({ data: payload, id: licence.data.id })
    ).then(() => {
      resetInventory();
    });
  };

  const handleTestTypeChange = (field, index, value) => {
    const clone = [...inventory];
    const item = { ...inventory[index] };
    item.testTypeId = parseAsInt(value);
    clone[index] = item;
    setInventory([...clone]);

    setValue(field, value);
  };

  const handleValueChange = (index, value) => {
    const clone = [...inventory];
    const item = { ...inventory[index] };
    item.value = parseAsFloat(value);
    clone[index] = item;
    setInventory([...clone]);
  };

  const handleDateChange = (field, index) => {
    return (value) => {
      const clone = [...inventory];
      const item = { ...inventory[index] };
      item.date = formatDate(value);
      clone[index] = item;
      setInventory([...clone]);
      setValue(field, value);
    };
  };

  const calculateAction = async (index) => {
    const clone = [...inventory];
    const item = { ...inventory[index] };

    const payload = {
      date: item.date,
      thresholdId: item.testTypeId,
      value: item.value,
    };

    await dispatch(
      calculateWarningLevyNotice({ data: payload, id: licence.data.id })
    ).then((data) => {
      const notice = data.payload;
      if (notice !== undefined) {
        item.action = notice.correspondenceDescription;
        item.levy = notice.levyPercentage;
        item.previousInfractionFirstDate = notice.previousInfractionFirstDate;
        item.previousInfractionCount = notice.previousInfractionCount;
        item.correspondence = notice.correspondence;

        clone[index] = item;
        setInventory([...clone]);

        setValue(`inventory[${index}].action`, item.action);
        setValue(`inventory[${index}].levy`, item.levy);
        setValue(
          `inventory[${index}].previousInfractionFirstDate`,
          item.previousInfractionFirstDate
        );
        setValue(
          `inventory[${index}].previousInfractionCount`,
          item.previousInfractionCount
        );
        setValue(`inventory[${index}].correspondence`, item.correspondence);
      }
    });
  };

  const testTypeOptions = [
    { description: "IBC", value: DAIRY_TEST_THRESHOLD_IDS.IBC },
    { description: "SCC", value: DAIRY_TEST_THRESHOLD_IDS.SCC },
    { description: "IH", value: DAIRY_TEST_THRESHOLD_IDS.IH },
    { description: "WATER", value: DAIRY_TEST_THRESHOLD_IDS.WATER },
  ];

  const filteredTestTypeOptions = testTypeOptions.filter(
    (x) => initialInventory.find((y) => y.testTypeId === x.value) === undefined
  );

  const dairyResultRow = (row, index) => {
    return (
      <Row key={index} className="mb-3">
        <Col>
          <Form.Control type="text" defaultValue={row.date} disabled />
        </Col>
        <Col>
          <Form.Control as="select" value={row.testTypeId} disabled>
            {testTypeOptions.map((x) => (
              <option key={x.value} value={x.value}>
                {x.description}
              </option>
            ))}
          </Form.Control>
        </Col>
        <Col>
          <Form.Control type="text" defaultValue={row.value} disabled />
        </Col>
        <Col>
          <Form.Control type="text" defaultValue={row.action} disabled />
        </Col>
        <Col>
          <Form.Control
            type="text"
            defaultValue={row.levy ? `${row.levy}%` : null}
            disabled
          />
        </Col>
        <Col />
      </Row>
    );
  };

  const dairyResultManualRow = (row, index) => {
    return (
      <Row key={index}>
        <Form.Control
          hidden
          ref={register}
          name={`inventory[${index}].action`}
        />
        <Form.Control hidden ref={register} name={`inventory[${index}].levy`} />
        <Form.Control
          hidden
          ref={register}
          name={`inventory[${index}].previousInfractionFirstDate`}
        />
        <Form.Control
          hidden
          ref={register}
          name={`inventory[${index}].previousInfractionCount`}
        />
        <Form.Control
          hidden
          ref={register}
          name={`inventory[${index}].correspondence`}
        />

        <Col>
          <Form.Group controlId={`inventoryDates[${index}].date`}>
            <CustomDatePicker
              id={`inventoryDates[${index}].date`}
              notifyOnChange={handleDateChange(
                `inventoryDates[${index}].date`,
                index
              )}
              notifyOnBlur={() => calculateAction(index)}
              defaultValue={parseAsDate(row.date)}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Control
            as="select"
            name={`inventory[${index}].testTypeId`}
            ref={register}
            onChange={(e) =>
              handleTestTypeChange(
                `inventory[${index}].testTypeId`,
                index,
                e.target.value
              )
            }
            value={row.testTypeId}
            onBlur={() => calculateAction(index)}
          >
            {filteredTestTypeOptions.map((x) => (
              <option key={x.value} value={x.value}>
                {x.description}
              </option>
            ))}
          </Form.Control>
        </Col>
        <Col>
          <Form.Group controlId={`inventory[${index}].value`}>
            <Form.Control
              type="text"
              name={`inventory[${index}].value`}
              defaultValue={row.value}
              ref={register}
              onChange={(e) => handleValueChange(index, e.target.value)}
              onBlur={() => calculateAction(index)}
            />
          </Form.Group>
        </Col>
        <Col>
          <Form.Control type="text" defaultValue={row.action} disabled />
        </Col>
        <Col>
          <Form.Control type="text" defaultValue={row.levy} disabled />
        </Col>
        <Col>
          <Button variant="link" onClick={() => deleteRow(index)}>
            Delete
          </Button>
        </Col>
      </Row>
    );
  };

  const openDairyTestHistoryModal = () => {
    dispatch(
      openModal(
        DAIRY_TEST_HISTORY_SEARCH,
        null,
        { licenceId: licence.data.id },
        "lg"
      )
    );
  };

  return (
    <>
      <SectionHeading>Dairy Test Inventory</SectionHeading>
      <Container className="mt-3 mb-4">
        {initialInventory.length === 0 ? (
          <>
            <ErrorMessageRow
              variant="success"
              errorHeading={null}
              errorMessage={"No dairy test data load information found."}
            />
            <Row className="mt-3">
              <Col lg={2}>
                <Button
                  size="md"
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    dispatch(openDairyTestHistoryModal);
                  }}
                  disabled={submitting}
                  block
                >
                  View History
                </Button>
              </Col>
            </Row>
          </>
        ) : (
          <Form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Row className="mb-3">
              <Col className="font-weight-bold">Date</Col>
              <Col className="font-weight-bold">Test Type</Col>
              <Col className="font-weight-bold">Result</Col>
              <Col className="font-weight-bold">Action</Col>
              <Col className="font-weight-bold">Levy</Col>
              <Col />
            </Row>
            {initialInventory.map((x, index) => {
              return dairyResultRow(x, index);
            })}
            {inventory.map((x, index) => {
              return dairyResultManualRow(x, index);
            })}
            <Row>
              <Col lg={2}>
                <Button
                  size="md"
                  type="button"
                  variant="secondary"
                  onClick={addInventoryOnClick}
                  disabled={
                    submitting ||
                    filteredTestTypeOptions.length === 0 ||
                    initialInventory.length === 0
                  }
                  block
                >
                  Add a result
                </Button>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col lg={2}>
                <Button
                  size="md"
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    dispatch(openDairyTestHistoryModal);
                  }}
                  disabled={submitting}
                  block
                >
                  View History
                </Button>
              </Col>
              <Col lg={2}>
                <Button
                  size="md"
                  type="button"
                  variant="secondary"
                  onClick={() => {}}
                  disabled={submitting || initialInventory.length === 0}
                  block
                >
                  Calculate
                </Button>
              </Col>
              <Col lg={2}>
                <Button
                  size="md"
                  type="button"
                  variant="secondary"
                  onClick={() => {}}
                  disabled={submitting || initialInventory.length === 0}
                  block
                >
                  Generate
                </Button>
              </Col>
              <Col lg={2}>
                <Button
                  size="md"
                  type="submit"
                  variant="primary"
                  disabled={submitting || inventory.length === 0}
                  block
                >
                  {submissionLabel}
                </Button>
              </Col>
            </Row>
          </Form>
        )}
        {dairyTestResults.status === REQUEST_STATUS.REJECTED ? (
          <ErrorMessageRow
            errorHeading={
              "An error was encountered while updating the licence."
            }
            errorMessage={`${dairyTestResults.error.code} ${dairyTestResults.error.description}`}
          />
        ) : null}
      </Container>
    </>
  );
}

LicenceDairyTestInventory.propTypes = {
  licence: PropTypes.object.isRequired,
};
