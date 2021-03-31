import React from "react";
import PropTypes from "prop-types";
import { Form, Alert, Spinner } from "react-bootstrap";

import { REQUEST_STATUS } from "../../utilities/constants";

const RegionalDistricts = React.forwardRef((props, ref) => {
  const { regions, selectedRegion, onChange, defaultValue, isInvalid } = props;

  let control = (
    <div>
      <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
    </div>
  );

  if (regions.status === REQUEST_STATUS.FULFILLED) {
    let districts = regions.data.regionalDistricts;

    // display all districts if no region is selected or if selected region has no districts
    if (selectedRegion !== null) {
      const filteredDistricts = districts.filter(
        (d) => d.region_id === selectedRegion
      );
      if (filteredDistricts.length > 0) {
        districts = filteredDistricts;
      }
    }

    control = (
      <Form.Control
        as="select"
        name="regionalDistrict"
        ref={ref}
        isInvalid={isInvalid}
        onChange={onChange}
        defaultValue={defaultValue}
        custom
      >
        <option value={null} />
        {districts.map((district) => (
          <option key={district.id} value={district.id}>
            {district.district_number} {district.district_name}
          </option>
        ))}
      </Form.Control>
    );
  } else if (regions.status === REQUEST_STATUS.REJECTED) {
    control = <Alert variant="danger">Error loading regional districts</Alert>;
  }

  return (
    <Form.Group controlId="regionalDistrict">
      <Form.Label>District</Form.Label>
      {control}
      <Form.Control.Feedback type="invalid">
        Please select a district.
      </Form.Control.Feedback>
    </Form.Group>
  );
});

RegionalDistricts.propTypes = {
  regions: PropTypes.object.isRequired,
  selectedRegion: PropTypes.number,
  onChange: PropTypes.func,
  defaultValue: PropTypes.string,
  isInvalid: PropTypes.object,
};
RegionalDistricts.defaultProps = {
  selectedRegion: null,
  defaultValue: null,
  onChange: undefined,
  isInvalid: undefined,
};

export default RegionalDistricts;
