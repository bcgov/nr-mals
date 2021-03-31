/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Button, Col, Container, Form, FormControl } from "react-bootstrap";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";

import { SEARCH_TYPE, SITE_RESULTS_PATHNAME } from "../../utilities/constants";
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
  selectSiteParameters,
  selectSiteSearchType,
  toggleSiteSearchType,
  setSiteParameters,
} from "./searchSlice";

export default function SiteSearchPage() {
  const searchType = useSelector(selectSiteSearchType);
  const defaultParameters = useSelector(selectSiteParameters);
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
    dispatch(setSiteParameters({ keyword: parameters.keyword }));
    history.push(SITE_RESULTS_PATHNAME);
  };

  const performAdvancedSearch = () => {
    dispatch(setSiteParameters({ ...parameters, keyword: undefined }));
    history.push(SITE_RESULTS_PATHNAME);
  };

  const toggleSearchType = () => dispatch(toggleSiteSearchType());

  return (
    <section>
      <PageHeading>Find a Site</PageHeading>
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
                  placeholder="Registrant Last Name, Licence Number, or Site ID"
                  aria-label="Registrant Last Name, Licence Number, or Site ID"
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
                    <Form.Label>Registrant Last Name</Form.Label>
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
                    <Form.Label>Client Email Address</Form.Label>
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
                  <Form.Group controlId="contactName">
                    <Form.Label>Site Contact Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="contactName"
                      defaultValue={defaultParameters.contactName}
                      onChange={(e) =>
                        setParameter("contactName", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
                <Col lg={6}>
                  <LicenceTypes
                    defaultValue={defaultParameters.licenceType}
                    onChange={(e) =>
                      setParameter("licenceType", e.target.value)
                    }
                    allowAny
                  />
                </Col>
              </Form.Row>
              <Form.Row>
                <Col lg={6}>
                  <Form.Group controlId="licenceNumber">
                    <Form.Label>Licence Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="licenceNumber"
                      defaultValue={defaultParameters.licenceNumber}
                      onChange={(e) =>
                        setParameter("licenceNumber", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
                <Col lg={6}>
                  <Form.Group controlId="siteId">
                    <Form.Label>Site ID</Form.Label>
                    <Form.Control
                      type="text"
                      name="siteId"
                      defaultValue={defaultParameters.siteId}
                      onChange={(e) => setParameter("siteId", e.target.value)}
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
