/* eslint-disable */
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

import VerticalField from "../../../components/VerticalField";
import { formatDateString } from "../../../utilities/formatting.ts";

import { useForm } from "react-hook-form";
import { Form, Row, Col } from "react-bootstrap";

import CustomCheckBox from "../../../components/CustomCheckBox";

import { updateSiteDairyTankRecheckNotice } from "../sitesSlice";

export default function DairyTankDetailsView({ dairyTank }) {
  const dispatch = useDispatch();

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { setValue } = form;

  useEffect(() => {
    setValue("printTankRecheckNotice", dairyTank.printRecheckNotice);
  }, [dispatch]);

  const onPrintTankRecheckNotice = (id, value) => {
    setValue("printTankRecheckNotice", value);

    console.log(id);
    console.log(value);
    dispatch(
      updateSiteDairyTankRecheckNotice({
        data: { checked: value },
        id: id,
      })
    );
  };

  return (
    <>
      <Row className="mt-3">
        <Col lg={3}>
          <VerticalField
            label="Tank Calibration Date"
            value={formatDateString(dairyTank.calibrationDate)}
          />
        </Col>
        <Col lg={3}>
          <VerticalField
            label="Tank Issue Date"
            value={formatDateString(dairyTank.issueDate)}
          />
        </Col>
        <Col lg={3}>
          <VerticalField label="Recheck Year" value={dairyTank.recheckYear} />
        </Col>
        <Col lg={3}>
          <VerticalField label="Serial Number" value={dairyTank.serialNumber} />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={3}>
          <VerticalField label="Model Number" value={dairyTank.modelNumber} />
        </Col>
        <Col lg={3}>
          <VerticalField label="Capacity" value={dairyTank.capacity} />
        </Col>
        <Col lg={3}>
          <VerticalField label="Manufacturer" value={dairyTank.manufacturer} />
        </Col>
      </Row>
      <Form.Row>
        <Col lg={4}>
          <Form.Group controlId="actionRequired">
            <CustomCheckBox
              id="printTankRecheckNotice"
              label="Tank Re-Check Notice"
              defaultChecked={dairyTank.printRecheckNotice}
              onChange={(e) =>
                onPrintTankRecheckNotice(dairyTank.id, e.target.checked)
              }
            />
          </Form.Group>
        </Col>
      </Form.Row>
    </>
  );
}

DairyTankDetailsView.propTypes = {
  dairyTank: PropTypes.object.isRequired,
};
