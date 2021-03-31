/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Button, Col, Container, Form, FormControl } from "react-bootstrap";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";

import {
  SEARCH_TYPE,
  LICENSE_RESULTS_PATHNAME,
} from "../../utilities/constants";
import { formatDate } from "../../utilities/formatting";
import { parseAsDate, parseAsInt } from "../../utilities/parsing";

import CustomDatePicker from "../../components/CustomDatePicker";
import PageHeading from "../../components/PageHeading";

import LicenceStatuses from "../lookups/LicenceStatuses";
import LicenceTypes from "../lookups/LicenceTypes";
import Regions from "../lookups/Regions";
import RegionalDistricts from "../lookups/RegionalDistricts";

import { fetchLicenceStatuses } from "../lookups/licenceStatusesSlice";
import { selectRegions, fetchRegions } from "../lookups/regionsSlice";
import {
  selectLicenceParameters,
  selectLicenceSearchType,
  toggleLicenceSearchType,
  setLicenceParameters,
} from "./searchSlice";

export default function LicenceSearchPage() {
  const searchType = useSelector(selectLicenceSearchType);
  const defaultParameters = useSelector(selectLicenceParameters);
  const regions = useSelector(selectRegions);

  const dispatch = useDispatch();
  const history = useHistory();

  const [parameters, setParameters] = useState(defaultParameters);

  useEffect(() => {
    dispatch(fetchRegions());
    dispatch(fetchLicenceStatuses());
  }, [dispatch]);

  const setParameter = (name, value) => {
    setParameters({
      ...parameters,
      [name]: value,
    });
  };

  const performSimpleSearch = () => {
    dispatch(setLicenceParameters({ keyword: parameters.keyword }));
    history.push(LICENSE_RESULTS_PATHNAME);
  };

  const performAdvancedSearch = () => {
    dispatch(setLicenceParameters({ ...parameters, keyword: undefined }));
    history.push(LICENSE_RESULTS_PATHNAME);
  };

  const toggleSearchType = () => dispatch(toggleLicenceSearchType());

  const selectedRegion = parseAsInt(parameters.region);

  return (
    <section>
      <PageHeading>Find a Licence</PageHeading>
      <section>
        <Form noValidate onSubmit={performSimpleSearch}>
          <Container>
            <Form.Row>
              <Col lg={8}>
                <FormControl
                  type="text"
                  id="keyword"
                  name="keyword"
                  defaultValue={defaultParameters.keyword}
                  disabled={searchType === SEARCH_TYPE.ADVANCED}
                  placeholder="Registrant Last Name, Company Name, Licence Number or IRMA"
                  aria-label="Registrant Last Name, Company Name, Licence Number or IRMA"
                  onChange={(e) => setParameter("keyword", e.target.value)}
                />
              </Col>
              <Col lg={1}>
                <Button
                  type="submit"
                  disabled={searchType === SEARCH_TYPE.ADVANCED}
                  variant="primary"
                  block
                >
                  <FaSearch />
                </Button>
              </Col>
              <Col lg={3}>
                <Form.Group>
                  <Button
                    type="button"
                    variant="secondary"
                    block
                    onClick={toggleSearchType}
                  >
                    {searchType === SEARCH_TYPE.SIMPLE ? (
                      <div>
                        <FaChevronDown /> Advanced Search
                      </div>
                    ) : (
                      <div>
                        <FaChevronUp /> Simple Search
                      </div>
                    )}
                  </Button>
                </Form.Group>
              </Col>
            </Form.Row>
          </Container>
        </Form>
      </section>
      {searchType === SEARCH_TYPE.ADVANCED && (
        <section>
          <Form noValidate onSubmit={performAdvancedSearch}>
            <Container>
              <Form.Row>
                <Col lg={6}>
                  <Form.Group controlId="registrantName">
                    <Form.Label>Registrant Last Name / Company Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="registrantName"
                      defaultValue={defaultParameters.registrantName}
                      onChange={(e) =>
                        setParameter("registrantName", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
                <Col lg={6}>
                  <Form.Group controlId="registrantEmail">
                    <Form.Label>Registrant Email Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="registrantEmail"
                      defaultValue={defaultParameters.registrantEmail}
                      onChange={(e) =>
                        setParameter("registrantEmail", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
              </Form.Row>
              <Form.Row>
                <Col lg={6}>
                  <LicenceTypes
                    defaultValue={defaultParameters.licenceType}
                    onChange={(e) =>
                      setParameter("licenceType", e.target.value)
                    }
                    allowAny
                  />
                </Col>
                <Col lg={6}>
                  <LicenceStatuses
                    defaultValue={defaultParameters.licenceStatus}
                    onChange={(e) =>
                      setParameter("licenceStatus", e.target.value)
                    }
                    allowAny
                  />
                </Col>
              </Form.Row>
              <Form.Row>
                <Col lg={3}>
                  <CustomDatePicker
                    id="issuedDateFrom"
                    label="Issued On Date From"
                    notifyOnChange={(value) =>
                      setParameter("issuedDateFrom", formatDate(value))
                    }
                    defaultValue={parseAsDate(defaultParameters.issuedDateFrom)}
                  />
                </Col>
                <Col lg={3}>
                  <CustomDatePicker
                    id="issuedDateTo"
                    label="Issued On Date To"
                    notifyOnChange={(value) =>
                      setParameter("issuedDateTo", formatDate(value))
                    }
                    defaultValue={parseAsDate(defaultParameters.issuedDateTo)}
                  />
                </Col>
                <Col lg={6}>
                  <Regions
                    regions={regions}
                    defaultValue={defaultParameters.region}
                    onChange={(e) => setParameter("region", e.target.value)}
                  />
                </Col>
              </Form.Row>
              <Form.Row>
                <Col lg={3}>
                  <CustomDatePicker
                    id="renewalDateFrom"
                    label="Renewal Date From"
                    notifyOnChange={(value) =>
                      setParameter("renewalDateFrom", formatDate(value))
                    }
                    defaultValue={parseAsDate(
                      defaultParameters.renewalDateFrom
                    )}
                  />
                </Col>
                <Col lg={3}>
                  <CustomDatePicker
                    id="renewalDateTo"
                    label="Renewal Date To"
                    notifyOnChange={(value) =>
                      setParameter("renewalDateTo", formatDate(value))
                    }
                    defaultValue={parseAsDate(defaultParameters.renewalDateTo)}
                  />
                </Col>
                <Col lg={6}>
                  <RegionalDistricts
                    regions={regions}
                    selectedRegion={selectedRegion}
                    defaultValue={defaultParameters.regionalDistrict}
                    onChange={(e) =>
                      setParameter("regionalDistrict", e.target.value)
                    }
                  />
                </Col>
              </Form.Row>
              <Form.Row className="mb-5">
                <Col lg={3}>
                  <CustomDatePicker
                    id="expiryDateFrom"
                    label="Expiry Date From"
                    notifyOnChange={(value) =>
                      setParameter("expiryDateFrom", formatDate(value))
                    }
                    defaultValue={parseAsDate(defaultParameters.expiryDateFrom)}
                  />
                </Col>
                <Col lg={3}>
                  <CustomDatePicker
                    id="expiryDateTo"
                    label="Expiry Date To"
                    notifyOnChange={(value) =>
                      setParameter("expiryDateTo", formatDate(value))
                    }
                    defaultValue={parseAsDate(defaultParameters.expiryDateTo)}
                  />
                </Col>
                <Col lg={6}>
                  <Form.Group controlId="city">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      defaultValue={defaultParameters.city}
                      onChange={(e) => setParameter("city", e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Form.Row>
              <Form.Row className="mt-5">
                <Col lg={{ span: 2, offset: 10 }}>
                  <Button type="submit" variant="primary" block>
                    Search
                  </Button>
                </Col>
              </Form.Row>
            </Container>
          </Form>
        </section>
      )}
    </section>
  );
}
