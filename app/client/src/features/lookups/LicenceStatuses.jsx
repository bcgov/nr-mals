import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Form, Alert, Spinner } from "react-bootstrap";

import { REQUEST_STATUS } from "../../utilities/constants";

import { selectLicenceStatuses } from "./licenceStatusesSlice";

const LicenceStatuses = React.forwardRef(({ isInvalid }, ref) => {
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
          ref={ref}
          custom
        >
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
});

LicenceStatuses.propTypes = {
  isInvalid: PropTypes.object,
};

LicenceStatuses.defaultProps = {
  isInvalid: undefined,
};

export default LicenceStatuses;
