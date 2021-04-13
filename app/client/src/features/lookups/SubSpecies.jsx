import React from "react";
import PropTypes from "prop-types";
import { Form, Alert, Spinner } from "react-bootstrap";

import { REQUEST_STATUS } from "../../utilities/constants";

const SubSpecies = React.forwardRef((props, ref) => {
  const { subspecies, speciesId, isInvalid, onChange, value, name } = props;

  let control = (
    <div>
      <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
    </div>
  );

  if (subspecies.status === REQUEST_STATUS.FULFILLED) {
    control = (
      <Form.Control
        as="select"
        name={name}
        ref={ref}
        isInvalid={isInvalid}
        onChange={onChange}
        value={value}
        custom
      >
        {subspecies.data.subSpecies
          .filter((x) => x.speciesCodeId === speciesId)
          .map((specie) => (
            <option key={specie.id} value={specie.id}>
              {specie.codeName}
            </option>
          ))}
      </Form.Control>
    );
  } else if (subspecies.status === REQUEST_STATUS.REJECTED) {
    control = <Alert variant="danger">Error loading code</Alert>;
  }

  return (
    <Form.Group controlId="subspecies">
      {control}
      <Form.Control.Feedback type="invalid">
        Please select a code.
      </Form.Control.Feedback>
    </Form.Group>
  );
});

SubSpecies.propTypes = {
  subspecies: PropTypes.object.isRequired,
  isInvalid: PropTypes.object,
  onChange: PropTypes.func,
  value: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  speciesId: PropTypes.number.isRequired,
};
SubSpecies.defaultProps = {
  isInvalid: undefined,
  onChange: undefined,
};

export default SubSpecies;
