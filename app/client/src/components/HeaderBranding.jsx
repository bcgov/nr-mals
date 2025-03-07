import React from "react";
import { Button } from "react-bootstrap";
import UserService from "../app/user-service";

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
          {UserService.getToken() ? (
            <Button
              variant="primary"
              type="button"
              onClick={() => UserService.doLogout()}
            >
              Log out
            </Button>
          ) : (
            <Button
              variant="primary"
              type="button"
              onClick={() => UserService.doLogin()}
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
