import React from "react";
import PropTypes from "prop-types";
import { Form, Alert, Spinner } from "react-bootstrap";

import { REQUEST_STATUS } from "../../utilities/constants";

const Species = React.forwardRef((props, ref) => {
  const { species, isInvalid, onChange, defaultValue, name, readOnly } = props;

  let control = (
    <div>
      <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
    </div>
  );

  if (species.status === REQUEST_STATUS.FULFILLED) {
    control = (
      <Form.Control
        as="select"
        name={name}
        ref={ref}
        isInvalid={isInvalid}
        onChange={onChange}
        defaultValue={defaultValue}
        custom
        disabled={readOnly}
      >
        {species.data.species.map((specie) => (
          <option key={specie.id} value={specie.id}>
            {specie.codeDescription}
          </option>
        ))}
      </Form.Control>
    );
  } else if (species.status === REQUEST_STATUS.REJECTED) {
    control = <Alert variant="danger">Error loading species</Alert>;
  }

  return (
    <Form.Group controlId="species">
      {control}
      <Form.Control.Feedback type="invalid">
        Please select a species.
      </Form.Control.Feedback>
    </Form.Group>
  );
});

Species.propTypes = {
  species: PropTypes.object.isRequired,
  isInvalid: PropTypes.object,
  onChange: PropTypes.func,
  defaultValue: PropTypes.number,
  name: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
};
Species.defaultProps = {
  isInvalid: undefined,
  onChange: undefined,
  defaultValue: null,
  readOnly: false,
};

export default Species;
