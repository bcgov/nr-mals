import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Form, Alert, Spinner } from "react-bootstrap";

import { REQUEST_STATUS } from "../../utilities/constants";

import { selectLicenceStatuses } from "./licenceStatusesSlice";

const LicenceStatuses = React.forwardRef(
  ({ onChange, allowAny, defaultValue, isInvalid }, ref) => {
    const licenceStatuses = useSelector(selectLicenceStatuses);

    let control = (
      <div>
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </div>
    );

    if (licenceStatuses.data) {
      control = (
        <>
          <Form.Control
            as="select"
            name="licenceStatus"
            isInvalid={isInvalid}
            onChange={onChange}
            defaultValue={defaultValue}
            ref={ref}
            custom
          >
            {allowAny && <option value={null} />}
            {licenceStatuses.data.map((type) => (
              <option key={type.id} value={type.id}>
                {type.code_description}
              </option>
            ))}
          </Form.Control>
          <Form.Control.Feedback type="invalid">
            Please select a licence status.
          </Form.Control.Feedback>
        </>
      );
    } else if (licenceStatuses.status === REQUEST_STATUS.REJECTED) {
      control = <Alert variant="danger">Error loading licence statuses</Alert>;
    }

    return (
      <Form.Group controlId="licenceStatus">
        <Form.Label>Licence Status</Form.Label>
        {control}
      </Form.Group>
    );
  }
);

LicenceStatuses.propTypes = {
  isInvalid: PropTypes.object,
  allowAny: PropTypes.bool,
  onChange: PropTypes.func,
  defaultValue: PropTypes.string,
};

LicenceStatuses.defaultProps = {
  isInvalid: undefined,
  allowAny: false,
  onChange: undefined,
  defaultValue: undefined,
};

export default LicenceStatuses;
