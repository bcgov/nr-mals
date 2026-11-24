import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import InspectionDatesEdit from './InspectionDatesEdit'

// package.json's transformIgnorePatterns stops Jest from handling CSS inside node_modules
jest.mock('react-datepicker/dist/react-datepicker.css', () => ({}))

const setup = (initialValues = { inspectionDate: null, recheckDate: null }) => {
  const values = { ...initialValues }
  const setValue = (field, value) => {
    values[field] = value
  }
  render(
    <InspectionDatesEdit
      setValue={setValue}
      initialValues={initialValues}
      recheckYears={2}
    />,
  )
  const change = (label, value) =>
    fireEvent.change(screen.getByLabelText(label), { target: { value } })
  return {
    values,
    setInspection: (value) => change('Inspection Date', value),
    setRecheck: (value) => change('Re-check Date', value),
    recheckInput: () => screen.getByLabelText('Re-check Date'),
  }
}

describe('InspectionDatesEdit', () => {
  test('shows the saved dates without changing them', () => {
    const { values, recheckInput } = setup({
      inspectionDate: new Date(2026, 2, 15),
      recheckDate: new Date(2029, 0, 1),
    })

    expect(recheckInput()).toHaveValue('2029-01-01')
    expect(values.recheckDate).toEqual(new Date(2029, 0, 1))
  })

  test('pre-fills the re-check date from the inspection date', () => {
    const { values, setInspection, recheckInput } = setup()

    setInspection('2026-03-15')

    expect(values.inspectionDate).toEqual(new Date(2026, 2, 15))
    expect(values.recheckDate).toEqual(new Date(2028, 2, 15))
    expect(recheckInput()).toHaveValue('2028-03-15')
  })

  test('allows the re-check date to be overridden', () => {
    const { values, setInspection, setRecheck } = setup()

    setInspection('2026-03-15')
    setRecheck('2027-06-01')

    expect(values.recheckDate).toEqual(new Date(2027, 5, 1))
  })

  test('keeps the displayed and saved re-check dates in sync when the same inspection date is re-entered', () => {
    const { values, setInspection, setRecheck, recheckInput } = setup()

    setInspection('2026-03-15')
    setRecheck('2027-06-01')
    setInspection('')
    setInspection('2026-03-15')

    expect(values.recheckDate).toEqual(new Date(2028, 2, 15))
    expect(recheckInput()).toHaveValue('2028-03-15')
  })

  test('moves a Feb 29 inspection to Feb 28', () => {
    const { values, setInspection } = setup()

    setInspection('2028-02-29')

    expect(values.recheckDate).toEqual(new Date(2030, 1, 28))
  })
})
