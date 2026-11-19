import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Table } from "react-bootstrap";

import { INSPECTIONS_PATHNAME } from "../../utilities/constants";

// Licence-level summary of apiary inspections (MALS2-124).
// Used by the licence page's Inspection Details section and the View History modal.
export default function ApiaryInspectionTable({ inspections, onNavigate }) {
  return (
    <Table striped size="sm" responsive className="mt-3 mb-0" hover>
      <thead className="thead-dark">
        <tr>
          <th className="text-nowrap">Date</th>
          <th className="text-nowrap">Inspector</th>
          <th className="text-nowrap">Site #</th>
          <th className="text-nowrap">Inspection Type</th>
          <th className="text-nowrap">AFB</th>
          <th className="text-nowrap">EFB</th>
          <th className="text-nowrap">Nosema</th>
          <th className="text-nowrap">Varroa</th>
          <th className="text-nowrap">Varroa Avg for Yard</th>
          <th className="text-nowrap">Chalkbrood</th>
          <th className="text-nowrap">Sacbrood</th>
          <th className="text-nowrap">SHB</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        {inspections.map((x) => (
          <tr key={x.id}>
            <td className="text-nowrap">
              <Link to={`${INSPECTIONS_PATHNAME}/${x.id}`} onClick={onNavigate}>
                {x.inspectionDate}
              </Link>
            </td>
            <td className="text-nowrap">{x.inspectorId}</td>
            <td className="text-nowrap">{x.apiarySiteId}</td>
            <td className="text-nowrap">{x.inspectionTypeDescription}</td>
            <td className="text-nowrap">{x.americanFoulbroodResult}</td>
            <td className="text-nowrap">{x.europeanFoulbroodResult}</td>
            <td className="text-nowrap">{x.nosemaResult}</td>
            <td className="text-nowrap">{x.varroaMiteResult}</td>
            <td className="text-nowrap">{x.varroaAvgYard}</td>
            <td className="text-nowrap">{x.chalkbroodResult}</td>
            <td className="text-nowrap">{x.sacbroodResult}</td>
            <td className="text-nowrap">{x.smallHiveBeetleResult}</td>
            <td style={{ minWidth: 200 }}>{x.inspectionComment}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

ApiaryInspectionTable.propTypes = {
  inspections: PropTypes.arrayOf(PropTypes.object).isRequired,
  onNavigate: PropTypes.func,
};

ApiaryInspectionTable.defaultProps = {
  onNavigate: undefined,
};
