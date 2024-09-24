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
  INSPECTIONS_PATHNAME,
  CREATE_INSPECTIONS_PATHNAME,
  SYSTEM_ROLES,
  // TRAILER_INSPECTIONS_PATHNAME,
  // CREATE_TRAILER_INSPECTIONS_PATHNAME,
} from "../../utilities/constants";

import RenderOnRole from "../../components/RenderOnRole";
import PageHeading from "../../components/PageHeading";
import SectionHeading from "../../components/SectionHeading";

import {
  fetchTrailer,
  selectCurrentTrailer,
  clearCreatedTrailer,
  clearCurrentTrailer,
} from "./trailersSlice";
import {
  fetchLicence,
  selectCurrentLicence,
  clearCurrentLicence,
} from "../licences/licencesSlice";

import TrailerHeader from "./TrailerHeader";
import LicenceDetailsView from "../licences/LicenceDetailsView";
import TrailerDetailsViewEdit from "./TrailerDetailsViewEdit";

import Comments from "../comments/Comments";

import "./ViewTrailerPage.scss";

export default function ViewTrailerPage() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { id } = useParams();
  const trailer = useSelector(selectCurrentTrailer);
  const licence = useSelector(selectCurrentLicence);
  useEffect(() => {
    dispatch(clearCreatedTrailer());
    dispatch(clearCurrentLicence());
    dispatch(clearCurrentTrailer());

    dispatch(fetchTrailer(id)).then((record) => {
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
  if (trailer.data && licence.data) {
    content = (
      <>
        <TrailerHeader trailer={trailer.data} licence={licence.data} />
        <section>
          <SectionHeading>License Details</SectionHeading>
          <Container className="mt-3 mb-4">
            <LicenceDetailsView licence={licence.data} />
          </Container>
        </section>

        <TrailerDetailsViewEdit trailer={trailer} licence={licence.data} />

        {/** this inspections code is for apiary and will need to be re-written for trailer inspections */}
        <section>
          <SectionHeading>Inspections</SectionHeading>
          <Container className="mt-3 mb-4">
            {trailer.data.inspections?.length > 0 ? (
              <>
                <Table striped size="sm" responsive className="mt-3 mb-0" hover>
                  <thead className="thead-dark">
                    <tr>
                      <th className="text-nowrap">Inspection Date</th>
                      <th className="text-nowrap">Inspector ID</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {trailer.data.inspections.map((result) =>
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
                        There are no inspections associated with this trailer.
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

        <Comments licence={licence.data} />
      </>
    );
  } else if (
    trailer.status === REQUEST_STATUS.IDLE ||
    trailer.status === REQUEST_STATUS.PENDING ||
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
          An error was encountered while loading the trailer.
        </Alert.Heading>
        {trailer.error && (
          <p>{`${trailer.error.code}: ${trailer.error.description}`}</p>
        )}
        {licence.error && (
          <p>{`${licence.error.code}: ${licence.error.description}`}</p>
        )}
      </Alert>
    );
  }

  return (
    <section>
      <PageHeading>View a Trailer Record</PageHeading>
      {content}
    </section>
  );
}
