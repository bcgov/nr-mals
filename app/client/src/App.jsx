import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import * as Constant from "./utilities/constants";
import HeaderBranding from "./components/HeaderBranding";
import HeaderNavigation from "./components/HeaderNavigation";

import "./App.scss";

function App() {
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
            <Route path="/licenses/create">
              <LicensesCreate />
            </Route>
            <Route path="/registrants/search">
              <RegistrantsSearch />
            </Route>
            <Route path="/sites/search">
              <SitesSearch />
            </Route>
            <Route path="/sites/create">
              <SitesCreate />
            </Route>
            <Route path="/contacts/create">
              <ContactsCreate />
            </Route>
            <Route path="/inspections/search">
              <InspectionsSearch />
            </Route>
            <Route path="/inspections/create">
              <InspectionsCreate />
            </Route>
            <Route path="/reports">
              <Reports />
            </Route>
            <Route path="/admin/users-and-roles">
              <UsersAndRoles />
            </Route>
            <Route path="/admin/license-types">
              <LicenseTypes />
            </Route>
            <Route path="/admin/sites">
              <Sites />
            </Route>
            <Route path="/admin/inspections">
              <Inspections />
            </Route>
            <Route path="/admin/dairy-test-results">
              <DairyTestResults />
            </Route>
            <Route path="/">
              <Home />
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

function LicensesCreate() {
  return <h2>Create License</h2>;
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

function Home() {
  return <h2>Home</h2>;
}

export default App;
