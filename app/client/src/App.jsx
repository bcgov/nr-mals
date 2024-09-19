import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter, Redirect, Switch } from "react-router-dom";
import { Container } from "react-bootstrap";

import * as Constant from "./utilities/constants";
import { fetchConfig } from "./features/config/configSlice";
import HeaderBranding from "./components/HeaderBranding";
import HeaderNavigation from "./components/HeaderNavigation";
import ProtectedRoute from "./components/ProtectedRoute";

import CreateLicencePage from "./features/licences/CreateLicencePage";
import ViewLicencePage from "./features/licences/ViewLicencePage";

import SelectCertificatesPage from "./features/documents/SelectCertificatesPage";
import DownloadCertificatesPage from "./features/documents/DownloadCertificatesPage";

import SelectRenewalsPage from "./features/documents/SelectRenewalsPage";
import SelectApiaryRenewalsPage from "./features/documents/SelectApiaryRenewalsPage";
import DownloadRenewalsPage from "./features/documents/DownloadRenewalsPage";

import SelectDairyNoticesPage from "./features/documents/SelectDairyNoticesPage";
import DownloadDairyNoticesPage from "./features/documents/DownloadDairyNoticesPage";

import SelectDairyTankNoticesPage from "./features/documents/SelectDairyTankNoticesPage";
import DownloadDairyTankNoticesPage from "./features/documents/DownloadDairyTankNoticesPage";

import LicenceSearchPage from "./features/search/LicenceSearchPage";
import LicenceResultsPage from "./features/search/LicenceResultsPage";

import SiteSearchPage from "./features/search/SiteSearchPage";
import SiteResultsPage from "./features/search/SiteResultsPage";

import ViewSitePage from "./features/sites/ViewSitePage";

import CreateInspectionPage from "./features/inspections/CreateInspectionPage";
import ViewInspectionPage from "./features/inspections/ViewInspectionPage";

import Reports from "./features/reports/Reports";

import AdminConfig from "./features/admin/AdminConfig";
import AdminDairyTestResults from "./features/admin/AdminDairyTestResults";
import AdminPremisesId from "./features/admin/AdminPremisesId";

import ViewTrailerPage from "./features/trailers/ViewTrailerPage";

import ModalComponent from "./components/ModalComponent";
import keycloak from "./app/keycloak";
import { fetchCurrentUser } from "./app/appSlice";

import "./App.scss";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchConfig());

    if (keycloak.getKeycloak()?.tokenParsed) {
      dispatch(
        fetchCurrentUser({
          data: { idir: keycloak.getKeycloak().tokenParsed.idir_username },
        })
      );
    }
  }, []);

  return (
    <BrowserRouter>
      <header>
        <HeaderBranding />
        <HeaderNavigation />
      </header>
      <main role="main">
        <ModalComponent />
        <Container id="main-content" className="mt-3">
          <Switch>
            <ProtectedRoute path={`${Constant.TRAILERS_PATHNAME}/:id`}>
              <ViewTrailerPage />
            </ProtectedRoute>
            <ProtectedRoute path={`${Constant.SEARCH_LICENSES_PATHNAME}`}>
              <LicenceSearchPage />
            </ProtectedRoute>
            <ProtectedRoute path={`${Constant.LICENSE_RESULTS_PATHNAME}`}>
              <LicenceResultsPage />
            </ProtectedRoute>
            <ProtectedRoute path={`${Constant.CREATE_LICENSES_PATHNAME}`}>
              <CreateLicencePage />
            </ProtectedRoute>
            <ProtectedRoute path={`${Constant.LICENSES_PATHNAME}/:id`}>
              <ViewLicencePage />
            </ProtectedRoute>
            <ProtectedRoute path={`${Constant.SEARCH_REGISTRANTS_PATHNAME}`}>
              <RegistrantsSearch />
            </ProtectedRoute>
            <ProtectedRoute path={`${Constant.SEARCH_SITES_PATHNAME}`}>
              <SiteSearchPage />
            </ProtectedRoute>
            <ProtectedRoute path={`${Constant.SITE_RESULTS_PATHNAME}`}>
              <SiteResultsPage />
            </ProtectedRoute>
            <ProtectedRoute path={`${Constant.SITES_PATHNAME}/:id`}>
              <ViewSitePage />
            </ProtectedRoute>
            <ProtectedRoute path={`${Constant.CREATE_CONTACTS_PATHNAME}`}>
              <ContactsCreate />
            </ProtectedRoute>
            <ProtectedRoute path={`${Constant.SEARCH_INSPECTIONS_PATHNAME}`}>
              <InspectionsSearch />
            </ProtectedRoute>
            <ProtectedRoute
              path={`${Constant.CREATE_INSPECTIONS_PATHNAME}/:id`}
            >
              <CreateInspectionPage />
            </ProtectedRoute>
            <ProtectedRoute path={`${Constant.INSPECTIONS_PATHNAME}/:id`}>
              <ViewInspectionPage />
            </ProtectedRoute>
            <ProtectedRoute path={`${Constant.REPORTS_PATHNAME}`}>
              <Reports />
            </ProtectedRoute>
            <ProtectedRoute path={`${Constant.DOWNLOAD_CERTIFICATES_PATHNAME}`}>
              <DownloadCertificatesPage />
            </ProtectedRoute>
            <ProtectedRoute path={`${Constant.SELECT_CERTIFICATES_PATHNAME}`}>
              <SelectCertificatesPage />
            </ProtectedRoute>
            <ProtectedRoute path={`${Constant.DOWNLOAD_RENEWALS_PATHNAME}`}>
              <DownloadRenewalsPage />
            </ProtectedRoute>
            <ProtectedRoute
              path={`${Constant.SELECT_RENEWALS_APIARY_PATHNAME}`}
            >
              <SelectApiaryRenewalsPage />
            </ProtectedRoute>
            <ProtectedRoute path={`${Constant.SELECT_RENEWALS_PATHNAME}`}>
              <SelectRenewalsPage />
            </ProtectedRoute>
            <ProtectedRoute path={`${Constant.DOWNLOAD_DAIRYNOTICES_PATHNAME}`}>
              <DownloadDairyNoticesPage />
            </ProtectedRoute>
            <ProtectedRoute path={`${Constant.SELECT_DAIRYNOTICES_PATHNAME}`}>
              <SelectDairyNoticesPage />
            </ProtectedRoute>
            <ProtectedRoute
              path={`${Constant.DOWNLOAD_DAIRYTANKNOTICES_PATHNAME}`}
            >
              <DownloadDairyTankNoticesPage />
            </ProtectedRoute>
            <ProtectedRoute
              path={`${Constant.SELECT_DAIRYTANKNOTICES_PATHNAME}`}
            >
              <SelectDairyTankNoticesPage />
            </ProtectedRoute>
            <ProtectedRoute
              path={`${Constant.ADMIN_CONFIG_PATHNAME}`}
              validRoles={[Constant.SYSTEM_ROLES.SYSTEM_ADMIN]}
            >
              <AdminConfig />
            </ProtectedRoute>
            <ProtectedRoute
              path={`${Constant.ADMIN_DAIRY_TEST_RESULTS_PATHNAME}`}
            >
              <AdminDairyTestResults />
            </ProtectedRoute>
            <ProtectedRoute path={`${Constant.ADMIN_PREMISES_ID_PATHNAME}`}>
              <AdminPremisesId />
            </ProtectedRoute>
            <ProtectedRoute path="/">
              <Redirect to={`${Constant.SEARCH_LICENSES_PATHNAME}`} />
            </ProtectedRoute>
          </Switch>
        </Container>
      </main>
    </BrowserRouter>
  );
}

function RegistrantsSearch() {
  return <h2>Search Registrants</h2>;
}

function ContactsCreate() {
  return <h2>Create Contact</h2>;
}

function InspectionsSearch() {
  return <h2>Search Inspections</h2>;
}

export default App;
