import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Form, Alert, Spinner } from "react-bootstrap";

import { REQUEST_STATUS } from "../../utilities/constants";

import {
  fetchLicenceStatuses,
  selectLicenceStatuses,
} from "./licenceStatusesSlice";

export default React.forwardRef((props, ref) => {
  const licenceStatuses = useSelector(selectLicenceStatuses);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchLicenceStatuses());
  }, [dispatch]);

  let control = (
    <div>
      <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
    </div>
  );

  if (licenceStatuses.status === REQUEST_STATUS.FULFILLED) {
    control = (
      <Form.Control as="select" name="licenceStatus" ref={ref} custom>
        {licenceStatuses.data.map((type) => (
          <option key={type.id} value={type.id}>
            {type.code_description}
          </option>
        ))}
      </Form.Control>
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
