import React from "react";
import { useSelector } from "react-redux";
import { Container, Nav, Navbar } from "react-bootstrap";
import * as Constant from "../utilities/constants";

import DropdownNavLink from "./DropdownNavLink";
import HeaderDropdown from "./HeaderDropdown";

import "./HeaderNavigation.scss";

import RenderOnRole from "./RenderOnRole";
import UserService from "../app/user-service";

function HeaderNavigation() {
  const { environment } = useSelector((state) => state.config.data);

  let environmentClass = "";
  if (environment === "dev") {
    environmentClass = "env-dev";
  } else if (environment === "test") {
    environmentClass = "env-test";
  } else if (environment === "uat") {
    environmentClass = "env-uat";
  }

  if (UserService.getToken()) {
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
                  id="document-generation-dropdown"
                  title="Document Generation"
                  pathPrefix={Constant.DOCUMENT_GENERATION_PATHNAME}
                >
                  <RenderOnRole
                    roles={[
                      Constant.SYSTEM_ROLES.USER,
                      Constant.SYSTEM_ROLES.SYSTEM_ADMIN,
                    ]}
                  >
                    <DropdownNavLink to={Constant.SELECT_RENEWALS_PATHNAME}>
                      Renewals
                    </DropdownNavLink>
                    <DropdownNavLink
                      to={Constant.SELECT_RENEWALS_APIARY_PATHNAME}
                    >
                      Renewals - Apiary
                    </DropdownNavLink>
                    <DropdownNavLink to={Constant.SELECT_DAIRYNOTICES_PATHNAME}>
                      Dairy Infractions
                    </DropdownNavLink>
                    <DropdownNavLink
                      to={Constant.SELECT_DAIRYTANKNOTICES_PATHNAME}
                    >
                      Dairy Tank ReCheck Notices
                    </DropdownNavLink>
                  </RenderOnRole>
                  <DropdownNavLink to={Constant.REPORTS_PATHNAME}>
                    Reports
                  </DropdownNavLink>
                  <RenderOnRole
                    roles={[
                      Constant.SYSTEM_ROLES.USER,
                      Constant.SYSTEM_ROLES.SYSTEM_ADMIN,
                    ]}
                  >
                    <DropdownNavLink to={Constant.SELECT_CERTIFICATES_PATHNAME}>
                      Certificates
                    </DropdownNavLink>
                  </RenderOnRole>
                </HeaderDropdown>
                <RenderOnRole roles={[Constant.SYSTEM_ROLES.SYSTEM_ADMIN]}>
                  <HeaderDropdown
                    id="admin-dropdown"
                    title="Administration"
                    pathPrefix={Constant.ADMIN_PATHNAME}
                  >
                    <DropdownNavLink to={Constant.ADMIN_CONFIG_PATHNAME}>
                      Configuration
                    </DropdownNavLink>
                    <DropdownNavLink
                      to={Constant.ADMIN_DAIRY_TEST_RESULTS_PATHNAME}
                    >
                      Dairy Test Results
                    </DropdownNavLink>
                    <DropdownNavLink to={Constant.ADMIN_PREMISES_ID_PATHNAME}>
                      Premises ID
                    </DropdownNavLink>
                  </HeaderDropdown>
                </RenderOnRole>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>
    );
  } else {
    return null;
  }
}

export default HeaderNavigation;
