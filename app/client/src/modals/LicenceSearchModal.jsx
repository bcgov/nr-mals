/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  Alert,
  Container,
  Spinner,
  Table,
  Row,
  Col,
  Button,
  ButtonGroup,
  Form,
  FormControl,
  Modal,
} from "react-bootstrap";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useForm, Controller } from "react-hook-form";

import {
  formatDateString,
  formatListShorten,
} from "../utilities/formatting.ts";

import { REQUEST_STATUS } from "../utilities/constants";

import { parseAsInt } from "../utilities/parsing";
import CustomCheckBox from "../components/CustomCheckBox";
import PageHeading from "../components/PageHeading";

import {
  fetchAssociatedLicenceResults,
  selectLicenceParameters,
  selectLicenceResults,
  setLicenceParameters,
  setLicenceSearchPage,
} from "../features/search/searchSlice";

export const LICENCE_SEARCH = "LICENCE_SEARCH_MODAL";

function navigateToSearchPage(dispatch, page, licenceTypeId) {
  dispatch(setLicenceSearchPage(page));
  dispatch(fetchAssociatedLicenceResults(licenceTypeId));
}

export default function LicenceSearchModal({
  licenceTypeId,
  closeModal,
  submit,
}) {
  const defaultParameters = useSelector(selectLicenceParameters);
  const results = useSelector(selectLicenceResults);
  const dispatch = useDispatch();

  const [parameters, setParameters] = useState(defaultParameters);

  const [selectedLicences, setSelectedLicences] = useState([]);

  useEffect(() => {}, [dispatch]);

  const onSearchSubmit = async () => {
    await dispatch(setLicenceParameters({ keyword: parameters.keyword }));
    dispatch(fetchAssociatedLicenceResults(licenceTypeId));
  };

  const onAssociateSubmit = async (data) => {
    submit(selectedLicences);
  };

  const setParameter = (name, value) => {
    setParameters({
      ...parameters,
      [name]: value,
    });
  };

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    errors,
  } = form;

  const updateToggle = (licence) => {
    const intId = parseAsInt(licence.licenceId);
    const index = selectedLicences.findIndex((x) => x.id === intId);

    if (index >= 0) {
      let clone = [...selectedLicences];
      clone.splice(index, 1);
      setSelectedLicences([...clone]);
    } else {
      setSelectedLicences([...selectedLicences, licence]);
    }
  };

  let control = null;
  if (results.status === REQUEST_STATUS.PENDING) {
    control = (
      <div>
        <Spinner animation="border" role="status">
          <span className="sr-only">Searching...</span>
        </Spinner>
      </div>
    );
  } else if (results.status === REQUEST_STATUS.REJECTED) {
    control = (
      <Alert variant="danger">
        <Alert.Heading>
          An error was encountered while retrieving results.
        </Alert.Heading>
        <p>
          {results.error.code}: {results.error.description}
        </p>
      </Alert>
    );
  } else if (
    results.status === REQUEST_STATUS.FULFILLED &&
    results.count === 0
  ) {
    control = (
      <>
        <Alert variant="success" className="mt-3">
          <div>Sorry, there were no results matching your search terms.</div>
          <div>
            Search Tips: check your spelling and try again, or try a different
            search term.
          </div>
        </Alert>
      </>
    );
  } else if (results.status === REQUEST_STATUS.FULFILLED && results.count > 0) {
    control = (
      <>
        <Table striped size="sm" responsive className="mt-3" hover>
          <thead className="thead-dark">
            <tr>
              <th></th>
              <th>Licence</th>
              <th className="text-nowrap">Licence Type</th>
              <th className="text-nowrap">Last Names</th>
              <th className="text-nowrap">Company Names</th>
              <th className="text-nowrap">Licence Status</th>
              <th className="text-nowrap">Issued On Date</th>
              <th className="text-nowrap">Expiry Date</th>
              <th>Region</th>
              <th>District</th>
            </tr>
          </thead>
          <tbody>
            {results.data.map((result, index) => {
              return (
                <tr key={result.licenceId}>
                  <td>
                    <Form.Check
                      name={`licences[${
                        (results.page - 1) * results.data.length + index
                      }].selected`}
                      ref={register}
                      defaultChecked={
                        selectedLicences.find(
                          (x) => x.id === result.licenceId
                        ) === undefined
                          ? false
                          : true
                      }
                      defaultValue={
                        selectedLicences.find(
                          (x) => x.id === result.licenceId
                        ) === undefined
                          ? false
                          : true
                      }
                      onChange={() => updateToggle(result)}
                    ></Form.Check>
                    <input
                      hidden
                      name={`licences[${
                        (results.page - 1) * results.data.length + index
                      }].licenceId`}
                      ref={register}
                      defaultValue={result.licenceId}
                    />
                  </td>
                  <td className="text-nowrap">
                    {result.licenceNumber}
                    <input
                      hidden
                      name={`licences[${
                        (results.page - 1) * results.data.length + index
                      }].licenceNumber`}
                      ref={register}
                      defaultValue={result.licenceNumber}
                    />
                  </td>
                  <td className="text-nowrap">
                    {result.licenceType}
                    <input
                      hidden
                      name={`licences[${
                        (results.page - 1) * results.data.length + index
                      }].licenceType`}
                      ref={register}
                      defaultValue={result.licenceType}
                    />
                  </td>
                  <td className="text-nowrap">
                    {formatListShorten(result.lastNames)}
                  </td>
                  <td className="text-nowrap">
                    {formatListShorten(result.companyNames)}
                  </td>
                  <td className="text-nowrap">{result.licenceStatus}</td>
                  <td className="text-nowrap">
                    {formatDateString(result.issuedOnDate)}
                  </td>
                  <td className="text-nowrap">
                    {formatDateString(result.expiryDate)}
                  </td>
                  <td className="text-nowrap">{result.region}</td>
                  <td className="text-nowrap">{result.regionalDistrict}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <Row className="mt-3 mb-3">
          <Col md="3"></Col>
          <Col className="d-flex justify-content-center">
            Showing {results.data.length} of {results.count} entries
          </Col>
          <Col md="auto">
            <ButtonGroup>
              <Button
                disabled={results.page < 2}
                onClick={() =>
                  navigateToSearchPage(
                    dispatch,
                    (results.page ?? 2) - 1,
                    licenceTypeId
                  )
                }
              >
                Previous
              </Button>
              <Button disabled>{results.page}</Button>
              <Button
                disabled={results.page * 20 > results.count}
                onClick={() =>
                  navigateToSearchPage(
                    dispatch,
                    (results.page ?? 0) + 1,
                    licenceTypeId
                  )
                }
              >
                Next
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      </>
    );
  }

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>Find a Licence</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Row>
          <Col lg={8}>
            <FormControl
              type="text"
              id="keyword"
              name="keyword"
              defaultValue={defaultParameters.keyword}
              placeholder="Registrant Last Name, Company Name, Licence Number or IRMA"
              aria-label="Registrant Last Name, Company Name, Licence Number or IRMA"
              onChange={(e) => setParameter("keyword", e.target.value)}
            />
          </Col>
          <Col lg={1}>
            <Button
              type="submit"
              variant="primary"
              block
              onClick={onSearchSubmit}
            >
              <FaSearch />
            </Button>
          </Col>
        </Form.Row>
      </Modal.Body>

      <Form noValidate onSubmit={handleSubmit(onAssociateSubmit)}>
        <Container>{control}</Container>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={
              !(
                results.status === REQUEST_STATUS.FULFILLED && results.count > 0
              )
            }
          >
            Associate Licence(s)
          </Button>
        </Modal.Footer>
      </Form>
    </>
  );
}

LicenceSearchModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
};

LicenceSearchModal.defaultProps = {
  licenceTypeId: null,
};
