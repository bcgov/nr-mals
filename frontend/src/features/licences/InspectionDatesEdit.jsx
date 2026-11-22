import React, { useState } from "react";
import PropTypes from "prop-types";
import { Form, Col } from "react-bootstrap";
import { add } from "date-fns";

import CustomDatePicker from "../../components/CustomDatePicker";

// Choosing an inspection date pre-fills the re-check date, which the user can still override
export default function InspectionDatesEdit({
  setValue,
  initialValues,
  recheckYears,
}) {
  const [recheck, setRecheck] = useState({
    date: initialValues.recheckDate,
    key: 0,
  });

  const onInspectionDateChange = (inspectionDate) => {
    setValue("inspectionDate", inspectionDate);

    if (inspectionDate) {
      const date = add(inspectionDate, { years: recheckYears });
      setValue("recheckDate", date);
      // CustomDatePicker ignores a defaultValue equal to its previous one, so a new key
      // is needed to replace a date that was manually overridden
      setRecheck(({ key }) => ({ date, key: key + 1 }));
    }
  };

  return (
    <Form.Row className="mt-3">
      <Col lg={4}>
        <CustomDatePicker
          id="inspectionDate"
          label="Inspection Date"
          notifyOnChange={onInspectionDateChange}
          defaultValue={initialValues.inspectionDate}
        />
      </Col>
      <Col lg={4}>
        <CustomDatePicker
          key={recheck.key}
          id="recheckDate"
          label="Re-check Date"
          notifyOnChange={(value) => setValue("recheckDate", value)}
          defaultValue={recheck.date}
        />
      </Col>
    </Form.Row>
  );
}

InspectionDatesEdit.propTypes = {
  setValue: PropTypes.func.isRequired,
  initialValues: PropTypes.object.isRequired,
  recheckYears: PropTypes.number.isRequired,
};
