import React from "react";
import { Button } from "react-bootstrap";
import keycloak from "../app/keycloak";

function HeaderBranding() {
  return (
    <nav id="header-branding" className="navbar navbar-expand-lg navbar-dark">
      <div className="container d-flex justify-content-start">
        <a className="navbar-brand" href="https://www2.gov.bc.ca">
          <img
            className="img-fluid d-none d-md-block"
            src={`${process.env.PUBLIC_URL}/images/bcid-logo-rev-en.svg`}
            width="181"
            height="44"
            alt="B.C. Government Logo"
          />
          <img
            className="img-fluid d-md-none"
            src={`${process.env.PUBLIC_URL}/images/bcid-symbol-rev.svg`}
            width="64"
            height="44"
            alt="B.C. Government Logo"
          />
        </a>
        <div className="navbar-brand">Agriculture Licensing System</div>
        <div className="ml-auto">
          {keycloak.getKeycloak()?.token ? (
            <Button
              variant="primary"
              type="button"
              onClick={() => keycloak.logout()}
            >
              Log out
            </Button>
          ) : (
            <Button
              variant="primary"
              type="button"
              onClick={() => keycloak.login()}
            >
              Log in
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default HeaderBranding;
