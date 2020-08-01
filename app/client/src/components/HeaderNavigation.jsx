import React, { Component } from "react";
import { connect } from "react-redux";
import { NavLink } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";
import PropTypes from "prop-types";

import * as Constant from "../utilities/constants";

import DropdownNavLink from "./DropdownNavLink";
import HeaderDropdown from "./HeaderDropdown";

import "./HeaderNavigation.scss";

const propTypes = {
  currentUser: PropTypes.object.isRequired,
};

export class HeaderNavigation extends Component {
  render() {
    const { currentUser } = this.props;

    let environmentClass = "";
    if (currentUser.environment === "dev") {
      environmentClass = "env-dev";
    } else if (currentUser.environment === "test") {
      environmentClass = "env-test";
    } else if (currentUser.environment === "uat") {
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
                  <DropdownNavLink to={Constant.CREATE_LICENSES_PATHNAME}>
                    Create License
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
                  title="Sites and Contacts"
                  pathPrefix={[
                    Constant.SITES_PATHNAME,
                    Constant.CONTACTS_PATHNAME,
                  ]}
                >
                  <DropdownNavLink to={Constant.SEARCH_SITES_PATHNAME}>
                    Search Sites
                  </DropdownNavLink>
                  <DropdownNavLink to={Constant.CREATE_SITES_PATHNAME}>
                    Create Site
                  </DropdownNavLink>
                  <DropdownNavLink to={Constant.CREATE_CONTACTS_PATHNAME}>
                    Create Contact
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
                <NavLink className="nav-link" to={Constant.REPORTS_PATHNAME}>
                  Reports
                </NavLink>
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
}

HeaderNavigation.propTypes = propTypes;

const mapStateToProps = (state) => ({
  currentUser: state.user,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(HeaderNavigation);
