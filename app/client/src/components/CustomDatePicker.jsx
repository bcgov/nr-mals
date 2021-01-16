import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import DatePicker, { registerLocale } from "react-datepicker";
import { Button, Form, InputGroup } from "react-bootstrap";
import { FaCalendar } from "react-icons/fa";
import format from "date-fns/format";
import isEqual from "date-fns/isEqual";
import isValid from "date-fns/isValid";
import parse from "date-fns/parse";
import canadianEnglish from "date-fns/locale/en-CA";

import "react-datepicker/dist/react-datepicker.css";

import "./CustomDatePicker.scss";

registerLocale("en-CA", canadianEnglish);

const DATE_FORMAT = "P"; // locale-specific short date

const CustomDatePicker = React.forwardRef((props, outerRef) => {
  const {
    id,
    label,
    notifyOnChange,
    defaultValue,
    isInvalid,
    invalidFeedback,
  } = props;

  const [date, setDate] = useState(defaultValue);

  const setDateWrapper = (value) => {
    setDate(value);
    notifyOnChange(value);
  };

  const defaultValueRepresentation = defaultValue
    ? defaultValue.getTime()
    : null;

  // reset date when defaultValue changes
  useEffect(() => {
    if (defaultValueRepresentation === null) {
      setDate(null);
    } else {
      setDate(new Date(defaultValueRepresentation));
    }
  }, [defaultValueRepresentation]);

  const CustomDatePickerInput = React.forwardRef(({ onClick }, ref) => {
    const handleOnBlur = (e) => {
      let newDate = parse(e.currentTarget.value, DATE_FORMAT, new Date(), {
        locale: canadianEnglish,
      });

      if (!isValid(newDate)) {
        newDate = null;
        e.currentTarget.value = "";
      }
      if (!isEqual(date, newDate)) {
        setDateWrapper(newDate);
      }
    };

    let dateString;
    try {
      dateString = format(date, DATE_FORMAT, { locale: canadianEnglish });
    } catch {
      dateString = "";
    }

    return (
      <Form.Group controlId={id}>
        <Form.Label>{label}</Form.Label>
        <InputGroup>
          <Form.Control
            type="text"
            name={id}
            defaultValue={dateString}
            onBlur={handleOnBlur}
            isInvalid={isInvalid}
            ref={ref}
          />
          <InputGroup.Append>
            <Button variant="outline-secondary" onMouseUp={onClick}>
              <FaCalendar />
            </Button>
          </InputGroup.Append>
          <Form.Control.Feedback type="invalid">
            {invalidFeedback}
          </Form.Control.Feedback>
        </InputGroup>
      </Form.Group>
    );
  });
  CustomDatePickerInput.propTypes = {
    onClick: PropTypes.func,
  };
  CustomDatePickerInput.defaultProps = {
    onClick: Function.prototype,
  };

  return (
    <DatePicker
      selected={date}
      dateFormat={DATE_FORMAT}
      onChange={setDateWrapper}
      popperPlacement="right"
      customInput={
        <CustomDatePickerInput
          date={date}
          setDateWrapper={setDateWrapper}
          fieldId={id}
          label={label}
          isInvalid={isInvalid}
          invalidFeedback={invalidFeedback}
          ref={outerRef}
        />
      }
      locale="en-CA"
      wrapperClassName="custom-date-picker"
      showYearDropdown
    />
  );
});

CustomDatePicker.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  notifyOnChange: PropTypes.func,
  defaultValue: PropTypes.instanceOf(Date),
  isInvalid: PropTypes.object,
  invalidFeedback: PropTypes.node,
};
CustomDatePicker.defaultProps = {
  notifyOnChange: Function.prototype,
  defaultValue: null,
  isInvalid: null,
  invalidFeedback: "Please input a valid date.",
};

export default CustomDatePicker;
