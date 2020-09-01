import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";

import * as Constant from "./utilities/constants";
import { fetchStatus } from "./features/status/statusSlice";
import HeaderBranding from "./components/HeaderBranding";
import HeaderNavigation from "./components/HeaderNavigation";

import LicensesCreate from "./features/licences/LicencesCreate";

import "./App.scss";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchStatus());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <header>
        <HeaderBranding />
        <HeaderNavigation />
      </header>
      <main role="main">
        <div className="container">
          <Switch>
            <Route path={`${Constant.SEARCH_LICENSES_PATHNAME}`}>
              <LicensesSearch />
            </Route>
            <Route path={`${Constant.CREATE_LICENSES_PATHNAME}`}>
              <LicensesCreate />
            </Route>
            <Route path={`${Constant.SEARCH_REGISTRANTS_PATHNAME}`}>
              <RegistrantsSearch />
            </Route>
            <Route path={`${Constant.SEARCH_SITES_PATHNAME}`}>
              <SitesSearch />
            </Route>
            <Route path={`${Constant.CREATE_SITES_PATHNAME}`}>
              <SitesCreate />
            </Route>
            <Route path={`${Constant.CREATE_CONTACTS_PATHNAME}`}>
              <ContactsCreate />
            </Route>
            <Route path={`${Constant.SEARCH_INSPECTIONS_PATHNAME}`}>
              <InspectionsSearch />
            </Route>
            <Route path={`${Constant.CREATE_INSPECTIONS_PATHNAME}`}>
              <InspectionsCreate />
            </Route>
            <Route path={`${Constant.REPORTS_PATHNAME}`}>
              <Reports />
            </Route>
            <Route path={`${Constant.USERS_AND_ROLES_ADMIN_PATHNAME}`}>
              <UsersAndRoles />
            </Route>
            <Route path={`${Constant.LICENSE_TYPES_ADMIN_PATHNAME}`}>
              <LicenseTypes />
            </Route>
            <Route path={`${Constant.SITES_ADMIN_PATHNAME}`}>
              <Sites />
            </Route>
            <Route path={`${Constant.INSPECTIONS_ADMIN_PATHNAME}`}>
              <Inspections />
            </Route>
            <Route path={`${Constant.DAIRY_TEST_RESULTS_ADMIN_PATHNAME}`}>
              <DairyTestResults />
            </Route>
            <Route path="/">
              <Redirect to={`${Constant.CREATE_LICENSES_PATHNAME}`} />
            </Route>
          </Switch>
        </div>
      </main>
    </BrowserRouter>
  );
}

function LicensesSearch() {
  return <h2>Search Licenses</h2>;
}

function RegistrantsSearch() {
  return <h2>Search Registrants</h2>;
}

function SitesSearch() {
  return <h2>Search Sites</h2>;
}

function SitesCreate() {
  return <h2>Create Site</h2>;
}

function ContactsCreate() {
  return <h2>Create Contact</h2>;
}

function InspectionsSearch() {
  return <h2>Search Inspections</h2>;
}

function InspectionsCreate() {
  return <h2>Create Inspection</h2>;
}

function Reports() {
  return <h2>Reports</h2>;
}

function UsersAndRoles() {
  return <h2>Users and Roles</h2>;
}

function LicenseTypes() {
  return <h2>License Types</h2>;
}

function Sites() {
  return <h2>Sites</h2>;
}

function Inspections() {
  return <h2>Inspections</h2>;
}

function DairyTestResults() {
  return <h2>Dairy Test Results</h2>;
}

export default App;
