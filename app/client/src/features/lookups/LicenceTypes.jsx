import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { Form, Alert, Spinner } from "react-bootstrap";

import { REQUEST_STATUS } from "../../utilities/constants";

import { fetchLicenceTypes, selectLicenceTypes } from "./licenceTypesSlice";

const LicenceTypes = React.forwardRef(
  ({ onChange, allowAny, defaultValue, label }, ref) => {
    const licenceTypes = useSelector(selectLicenceTypes);
    const dispatch = useDispatch();

    useEffect(() => {
      dispatch(fetchLicenceTypes());
    }, [dispatch]);

    let control = (
      <div>
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </div>
    );

    if (licenceTypes.status === REQUEST_STATUS.FULFILLED) {
      control = (
        <Form.Control
          as="select"
          name="licenceType"
          defaultValue={defaultValue}
          onChange={onChange}
          ref={ref}
          custom
        >
          {allowAny && <option value={null} />}
          {licenceTypes.data.map((type) => (
            <option key={type.id} value={type.id}>
              {type.licenceType}
            </option>
          ))}
        </Form.Control>
      );
    } else if (licenceTypes.status === REQUEST_STATUS.REJECTED) {
      control = <Alert variant="danger">Error loading licence types</Alert>;
    }

    return (
      <Form.Group controlId="licenceType">
        <Form.Label>{label}</Form.Label>
        {control}
      </Form.Group>
    );
  }
);

LicenceTypes.propTypes = {
  onChange: PropTypes.func,
  allowAny: PropTypes.bool,
  defaultValue: PropTypes.string,
  label: PropTypes.string,
};
LicenceTypes.defaultProps = {
  onChange: undefined,
  allowAny: false,
  defaultValue: undefined,
  label: "Licence Type",
};

export default LicenceTypes;
