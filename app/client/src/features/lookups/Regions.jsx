import React from "react";
import PropTypes from "prop-types";
import { Form, Alert, Spinner } from "react-bootstrap";

import { REQUEST_STATUS } from "../../utilities/constants";

const Regions = React.forwardRef((props, ref) => {
  const { regions, isInvalid, onChange, defaultValue } = props;

  let control = (
    <div>
      <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
    </div>
  );

  if (regions.status === REQUEST_STATUS.FULFILLED) {
    control = (
      <Form.Control
        as="select"
        name="region"
        ref={ref}
        isInvalid={isInvalid}
        onChange={onChange}
        defaultValue={defaultValue}
        custom
      >
        <option value={null} />
        {regions.data.regions.map((region) => (
          <option key={region.id} value={region.id}>
            {region.region_number} {region.region_name}
          </option>
        ))}
      </Form.Control>
    );
  } else if (regions.status === REQUEST_STATUS.REJECTED) {
    control = <Alert variant="danger">Error loading regions</Alert>;
  }

  return (
    <Form.Group controlId="region">
      <Form.Label>Region</Form.Label>
      {control}
      <Form.Control.Feedback type="invalid">
        Please select a region.
      </Form.Control.Feedback>
    </Form.Group>
  );
});

Regions.propTypes = {
  regions: PropTypes.object.isRequired,
  isInvalid: PropTypes.object,
  onChange: PropTypes.func,
  defaultValue: PropTypes.string,
};
Regions.defaultProps = {
  isInvalid: undefined,
  onChange: undefined,
  defaultValue: null,
};

export default Regions;
