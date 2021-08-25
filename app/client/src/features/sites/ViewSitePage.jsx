import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useParams, useHistory } from "react-router-dom";
import {
  Spinner,
  Alert,
  Container,
  Table,
  Row,
  Col,
  Button,
} from "react-bootstrap";

import {
  REQUEST_STATUS,
  CREATE_INSPECTIONS_PATHNAME,
  INSPECTIONS_PATHNAME,
  SYSTEM_ROLES,
} from "../../utilities/constants";

import RenderOnRole from "../../components/RenderOnRole";
import PageHeading from "../../components/PageHeading";
import SectionHeading from "../../components/SectionHeading";

import { fetchSite, selectCurrentSite, clearCreatedSite } from "./sitesSlice";
import { fetchLicence, selectCurrentLicence } from "../licences/licencesSlice";

import SiteHeader from "./SiteHeader";
import LicenceDetailsView from "../licences/LicenceDetailsView";
import SiteDetailsViewEdit from "./SiteDetailsViewEdit";

import Comments from "../comments/Comments";

import "./ViewSitePage.scss";
import DairyTanksViewEdit from "./dairytanks/DairyTanksViewEdit";
import {
  LICENCE_TYPE_ID_DAIRY_FARM,
  LICENCE_TYPE_ID_APIARY,
} from "../licences/constants";

export default function ViewLicencePage() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { id } = useParams();
  const site = useSelector(selectCurrentSite);
  const licence = useSelector(selectCurrentLicence);
  useEffect(() => {
    dispatch(clearCreatedSite());

    dispatch(fetchSite(id)).then((record) => {
      dispatch(fetchLicence(record.payload.licenceId));
    });
  }, [dispatch, id]);

  function formatInspectionsResultRow(result) {
    const url = `${INSPECTIONS_PATHNAME}/${result.id}`;
    return (
      <tr key={result.id}>
        <td className="text-nowrap">{result.inspectionDate}</td>
        <td className="text-nowrap">{result.inspectorId}</td>
        <td className="text-nowrap">
          <Link to={url}>View</Link>
        </td>
      </tr>
    );
  }

  function addInspectionOnClick() {
    history.push(`${CREATE_INSPECTIONS_PATHNAME}/${id}`);
  }

  const addInspectionButton = (
    <Button
      size="md"
      type="button"
      variant="primary"
      onClick={addInspectionOnClick}
      block
    >
      Create Inspection
    </Button>
  );

  let content;
  if (site.data && licence.data) {
    content = (
      <>
        <SiteHeader site={site.data} licence={licence.data} />
        <section>
          <SectionHeading>License Details</SectionHeading>
          <Container className="mt-3 mb-4">
            <LicenceDetailsView licence={licence.data} />
          </Container>
        </section>

        <SiteDetailsViewEdit site={site} licence={licence.data} />
        {licence.data.licenceTypeId === LICENCE_TYPE_ID_DAIRY_FARM ? (
          <DairyTanksViewEdit site={site} />
        ) : null}
        {licence.data.licenceTypeId === LICENCE_TYPE_ID_APIARY ? (
          <section>
            <SectionHeading>Inspections</SectionHeading>
            <Container className="mt-3 mb-4">
              {site.data.inspections?.length > 0 ? (
                <>
                  <Table
                    striped
                    size="sm"
                    responsive
                    className="mt-3 mb-0"
                    hover
                  >
                    <thead className="thead-dark">
                      <tr>
                        <th className="text-nowrap">Inspection Date</th>
                        <th className="text-nowrap">Inspector ID</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {site.data.inspections.map((result) =>
                        formatInspectionsResultRow(result)
                      )}
                    </tbody>
                  </Table>
                  <RenderOnRole
                    roles={[
                      SYSTEM_ROLES.USER,
                      SYSTEM_ROLES.INSPECTOR,
                      SYSTEM_ROLES.SYSTEM_ADMIN,
                    ]}
                  >
                    <Row className="mt-3">
                      <Col lg={3}>{addInspectionButton}</Col>
                    </Row>
                  </RenderOnRole>
                </>
              ) : (
                <>
                  <Row className="mt-3">
                    <Col>
                      <Alert variant="success" className="mt-3">
                        <div>
                          There are no inspections associated with this site.
                        </div>
                      </Alert>
                    </Col>
                  </Row>
                  <RenderOnRole
                    roles={[
                      SYSTEM_ROLES.USER,
                      SYSTEM_ROLES.INSPECTOR,
                      SYSTEM_ROLES.SYSTEM_ADMIN,
                    ]}
                  >
                    <Row className="mt-3">
                      <Col lg={3}>{addInspectionButton}</Col>
                    </Row>
                  </RenderOnRole>
                </>
              )}
            </Container>
          </section>
        ) : null}
        <Comments licence={licence.data} />
      </>
    );
  } else if (
    site.status === REQUEST_STATUS.IDLE ||
    site.status === REQUEST_STATUS.PENDING ||
    licence.status === REQUEST_STATUS.IDLE ||
    licence.status === REQUEST_STATUS.PENDING
  ) {
    content = (
      <Spinner animation="border" role="status" variant="primary">
        <span className="sr-only">Loading...</span>
      </Spinner>
    );
  } else {
    content = (
      <Alert variant="danger">
        <Alert.Heading>
          An error was encountered while loading the site.
        </Alert.Heading>
        {site.error && <p>{`${site.error.code}: ${site.error.description}`}</p>}
        {licence.error && (
          <p>{`${licence.error.code}: ${licence.error.description}`}</p>
        )}
      </Alert>
    );
  }

  return (
    <section>
      <PageHeading>View a Site Record</PageHeading>
      {content}
    </section>
  );
}
