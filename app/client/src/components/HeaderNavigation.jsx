/* eslint-disable */
import React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";

import * as Constant from "../utilities/constants";

import DropdownNavLink from "./DropdownNavLink";
import HeaderDropdown from "./HeaderDropdown";

import "./HeaderNavigation.scss";

function HeaderNavigation() {
  const { environment } = useSelector((state) => state.status.data);

  let environmentClass = "";
  if (environment === "dev") {
    environmentClass = "env-dev";
  } else if (environment === "test") {
    environmentClass = "env-test";
  } else if (environment === "uat") {
    environmentClass = "env-uat";
  }

  return (
    <header>
      <Navbar expand="lg" id="main-menu" className={environmentClass}>
        <Container className="justify-content-start">
          <Navbar.Toggle aria-controls="main-menu-nav" />
          <Navbar.Collapse id="main-menu-nav">
            <Nav>
              <HeaderDropdown
                id="licenses-dropdown"
                title="Licenses"
                pathPrefix={Constant.LICENSES_PATHNAME}
              >
                <DropdownNavLink to={Constant.SEARCH_LICENSES_PATHNAME}>
                  Search Licenses
                </DropdownNavLink>
              </HeaderDropdown>
              <HeaderDropdown
                id="registrants-dropdown"
                title="Registrants"
                pathPrefix={Constant.REGISTRANTS_PATHNAME}
              >
                <DropdownNavLink to={Constant.SEARCH_REGISTRANTS_PATHNAME}>
                  Search Registrants
                </DropdownNavLink>
              </HeaderDropdown>
              <HeaderDropdown
                id="sites-and-contacts-dropdown"
                title="Sites"
                pathPrefix={[
                  Constant.SITES_PATHNAME,
                  Constant.CONTACTS_PATHNAME,
                ]}
              >
                <DropdownNavLink to={Constant.SEARCH_SITES_PATHNAME}>
                  Search Sites
                </DropdownNavLink>
              </HeaderDropdown>
              <HeaderDropdown
                id="inspections-dropdown"
                title="Inspections"
                pathPrefix={Constant.INSPECTIONS_PATHNAME}
              >
                <DropdownNavLink to={Constant.SEARCH_INSPECTIONS_PATHNAME}>
                  Search Inspections
                </DropdownNavLink>
                <DropdownNavLink to={Constant.CREATE_INSPECTIONS_PATHNAME}>
                  Create Inspection
                </DropdownNavLink>
              </HeaderDropdown>
              <HeaderDropdown
                id="document-generation-dropdown"
                title="Document Generation"
                pathPrefix={Constant.DOCUMENT_GENERATION_PATHNAME}
              >
                <DropdownNavLink to={Constant.NOTICES_PATHNAME}>
                  Notices
                </DropdownNavLink>
                <DropdownNavLink to={Constant.REPORTS_PATHNAME}>
                  Reports
                </DropdownNavLink>
                <DropdownNavLink to={Constant.SELECT_CERTIFICATES_PATHNAME}>
                  Certificates
                </DropdownNavLink>
              </HeaderDropdown>
              <HeaderDropdown
                id="admin-dropdown"
                title="System Admin"
                pathPrefix={Constant.ADMIN_PATHNAME}
              >
                <DropdownNavLink to={Constant.USERS_AND_ROLES_ADMIN_PATHNAME}>
                  Users and Roles
                </DropdownNavLink>
                <DropdownNavLink to={Constant.LICENSE_TYPES_ADMIN_PATHNAME}>
                  License Types
                </DropdownNavLink>
                <DropdownNavLink to={Constant.SITES_ADMIN_PATHNAME}>
                  Sites
                </DropdownNavLink>
                <DropdownNavLink to={Constant.INSPECTIONS_ADMIN_PATHNAME}>
                  Inspections
                </DropdownNavLink>
                <DropdownNavLink
                  to={Constant.DAIRY_TEST_RESULTS_ADMIN_PATHNAME}
                >
                  Dairy Test Results
                </DropdownNavLink>
              </HeaderDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}

export default HeaderNavigation;
