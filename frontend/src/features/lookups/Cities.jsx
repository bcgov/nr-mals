import React from 'react'
import PropTypes from 'prop-types'
import { Form, Alert, Spinner } from 'react-bootstrap'

import { REQUEST_STATUS } from '../../utilities/constants'

const Cities = React.forwardRef((props, ref) => {
  const { cities, isInvalid, onChange, value } = props

  let control = (
    <div>
      <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
    </div>
  )

  if (cities && cities.status === REQUEST_STATUS.FULFILLED) {
    const cityOptions = cities.data.map((city) => (
      <option key={city.id} value={city.cityName}>
        {city.cityDescription}
      </option>
    ))

    // If the current value is not in the cities list, add it as an option
    const valueExists = cities.data.some((city) => city.cityName === value)
    if (value && !valueExists) {
      cityOptions.unshift(
        <option key="current-value" value={value}>
          {value}
        </option>,
      )
    }

    control = (
      <Form.Control
        as="select"
        name="city"
        ref={ref}
        isInvalid={isInvalid}
        onChange={onChange}
        value={value || ''}
        custom
      >
        <option value={null} />
        {cityOptions}
      </Form.Control>
    )
  } else if (cities && cities.status === REQUEST_STATUS.REJECTED) {
    control = <Alert variant="danger">Error loading cities</Alert>
  }

  return (
    <Form.Group controlId="region">
      <Form.Label>City</Form.Label>
      {control}
      <Form.Control.Feedback type="invalid">
        Please select a city.
      </Form.Control.Feedback>
    </Form.Group>
  )
})

Cities.propTypes = {
  cities: PropTypes.object.isRequired,
  isInvalid: PropTypes.object,
  onChange: PropTypes.func,
  defaultValue: PropTypes.string,
}
Cities.defaultProps = {
  isInvalid: undefined,
  onChange: undefined,
  defaultValue: null,
}

export default Cities
