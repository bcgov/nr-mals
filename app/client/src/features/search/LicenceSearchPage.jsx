import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Button, Col, Container, Form, FormControl } from "react-bootstrap";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";

import {
  SEARCH_TYPE,
  LICENSE_RESULTS_PATHNAME,
} from "../../utilities/constants";

import PageHeading from "../../components/PageHeading";

import { fetchLicenceStatuses } from "../lookups/licenceStatusesSlice";
import { fetchRegions } from "../lookups/regionsSlice";
import {
  selectLicenceSearchType,
  toggleLicenceSearchType,
  setLicenceParameters,
} from "./searchSlice";

export default function LicenceSearchPage() {
  const searchType = useSelector(selectLicenceSearchType);
  const dispatch = useDispatch();
  const history = useHistory();

  const [keywordParameter, setKeywordParameter] = useState(null);

  useEffect(() => {
    dispatch(fetchRegions());
    dispatch(fetchLicenceStatuses());
  }, [dispatch]);

  const performSimpleSearch = () => {
    const parameters = {
      keyword: keywordParameter,
    };
    dispatch(setLicenceParameters(parameters));
    history.push(LICENSE_RESULTS_PATHNAME);
  };

  const toggleSearchType = () => dispatch(toggleLicenceSearchType());

  return (
    <section>
      <PageHeading>Find a Licence</PageHeading>
      <Form noValidate>
        <section>
          <Container>
            <Form.Row>
              <Col lg={8}>
                <FormControl
                  type="text"
                  id="keyword"
                  name="keyword"
                  disabled={searchType === SEARCH_TYPE.ADVANCED}
                  placeholder="Registrant Last Name, Company Name, Licence Number or IRMA"
                  aria-label="Registrant Last Name, Company Name, Licence Number or IRMA"
                  onChange={(e) => setKeywordParameter(e.target.value)}
                />
              </Col>
              <Col lg={1}>
                <Button
                  type="button"
                  disabled={searchType === SEARCH_TYPE.ADVANCED}
                  variant="primary"
                  block
                  onClick={performSimpleSearch}
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
        </section>
        {searchType === SEARCH_TYPE.ADVANCED && (
          <section>{/* TO DO */}</section>
        )}
      </Form>
    </section>
  );
}
