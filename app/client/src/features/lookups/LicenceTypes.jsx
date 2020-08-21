import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Form, Alert, Spinner } from "react-bootstrap";

import { REQUEST_STATUS } from "../../utilities/constants";

import { fetchLicenceTypes, selectLicenceTypes } from "./licenceTypesSlice";

export default React.forwardRef((props, ref) => {
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
      <Form.Control as="select" name="licenceType" ref={ref} custom>
        {licenceTypes.data.map((type) => (
          <option key={type.id} value={type.id}>
            {type.licence_name}
          </option>
        ))}
      </Form.Control>
    );
  } else if (licenceTypes.status === REQUEST_STATUS.REJECTED) {
    control = <Alert variant="danger">Error loading licence types</Alert>;
  }

  return (
    <Form.Group controlId="licenceType">
      <Form.Label>Licence Type</Form.Label>
      {control}
    </Form.Group>
  );
});
