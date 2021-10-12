import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spinner, Table, Button } from "react-bootstrap";

import SectionHeading from "../../components/SectionHeading";
import ErrorMessageRow from "../../components/ErrorMessageRow";

import {
  fetchLicenceTypes,
  updateLicenceTypes,
  selectLicenceTypes,
} from "../lookups/licenceTypesSlice";

import { REQUEST_STATUS } from "../../utilities/constants";

import { openModal } from "../../app/appSlice";
import { LICENCE_TYPE } from "../../modals/LicenceTypeModal";

export default function AdminManageLicenceTypes() {
  const licenceTypes = useSelector(selectLicenceTypes);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchLicenceTypes());
  }, [dispatch]);

  const editCallback = (data) => {
    dispatch(updateLicenceTypes({ payload: data, id: data.id }));
  };

  function onEdit(result) {
    dispatch(
      openModal(LICENCE_TYPE, editCallback, { licenceType: result }, "md")
    );
  }

  function formatResultRow(result, showOptions = true) {
    return (
      <tr key={result.id}>
        <td className="text-nowrap">{result.licenceType}</td>
        <td className="text-nowrap">{result.standardFee}</td>
        <td className="text-nowrap">{result.licenceTerm}</td>
        <td className="text-nowrap">{result.standardIssueDate}</td>
        <td className="text-nowrap">{result.standardExpiryDate}</td>
        <td className="text-nowrap">{result.renewalNotice}</td>
        {showOptions ? (
          <>
            <td className="text-nowrap">
              <Button variant="link" onClick={async () => onEdit(result)}>
                Edit
              </Button>
            </td>
          </>
        ) : null}
      </tr>
    );
  }

  let errorMessage = null;
  if (licenceTypes.status === REQUEST_STATUS.REJECTED) {
    errorMessage = `${licenceTypes.error.code}: ${licenceTypes.error.description}`;
  }

  return (
    <>
      <SectionHeading>Manage Licence Types</SectionHeading>

      <Table striped size="sm" responsive className="mt-3" hover>
        <thead className="thead-dark">
          <tr>
            <th className="text-nowrap">Licence Type</th>
            <th className="text-nowrap">Standard Fee ($)</th>
            <th className="text-nowrap">Licence Term (Years)</th>
            <th className="text-nowrap">Standard Issue Date</th>
            <th className="text-nowrap">Standard Expiry Date</th>
            <th className="text-nowrap">Renewal Notice Term</th>
            <th className="text-nowrap" />
          </tr>
        </thead>
        {licenceTypes.status === REQUEST_STATUS.FULFILLED ? (
          <tbody>
            {licenceTypes.data.map((user) => formatResultRow(user))}
          </tbody>
        ) : null}
      </Table>
      {licenceTypes.status === REQUEST_STATUS.PENDING ? (
        <Spinner animation="border" role="status">
          <span className="sr-only">Searching...</span>
        </Spinner>
      ) : null}
      <ErrorMessageRow errorMessage={errorMessage} />
    </>
  );
}

AdminManageLicenceTypes.propTypes = {};
