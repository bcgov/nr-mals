import React from "react";
import PropTypes from "prop-types";
import { Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { formatDateTimeString } from "../../utilities/formatting.ts";

import HorizontalField from "../../components/HorizontalField";

import { LICENSES_PATHNAME } from "../../utilities/constants";

export default function SiteHeader({ site, licence }) {
  const url = `${LICENSES_PATHNAME}/${licence.id}`;

  return (
    <header>
      <Container className="mt-3 mb-4">
        <Row>
          <HorizontalField
            label="Licence Number"
            value={<Link to={url}>{licence.licenceNumber}</Link>}
          />
          <div className="w-100 d-xl-none" />
          <HorizontalField label="Created By" value={licence.createdBy} />
          <div className="w-100 d-xl-none" />
          <HorizontalField
            label="Created On"
            value={formatDateTimeString(licence.createdOn)}
          />
          <div className="w-100" />
          <HorizontalField label="Licence Type" value={licence.licenceType} />
          <div className="w-100 d-xl-none" />
          <HorizontalField label="Last Changed By" value={licence.updatedBy} />
          <div className="w-100 d-xl-none" />
          <HorizontalField
            label="Last Changed On"
            value={formatDateTimeString(licence.updatedOn)}
          />
          <div className="w-100" />
          <HorizontalField
            label="Site ID"
            value={
              site.apiarySiteId
                ? `${licence.licenceNumber}-${site.apiarySiteId}`
                : site.id
            }
          />
          <div className="w-100 d-xl-none" />
          <HorizontalField label="" value={null} />
          <div className="w-100 d-xl-none" />
          <HorizontalField label="" value={null} />
        </Row>
      </Container>
    </header>
  );
}

SiteHeader.propTypes = {
  site: PropTypes.object.isRequired,
  licence: PropTypes.object.isRequired,
};
