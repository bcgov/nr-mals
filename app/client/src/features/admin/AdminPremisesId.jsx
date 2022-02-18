import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Spinner, Table, Form, Button } from "react-bootstrap";

import PageHeading from "../../components/PageHeading";
import ErrorMessageRow from "../../components/ErrorMessageRow";

import { parseAsInt, parseAsFloat } from "../../utilities/parsing";
import { REQUEST_STATUS } from "../../utilities/constants";
import {
  updatePremisesIdResults,
  selectPremisesIdResults,
  clearPremisesIdResults,
} from "./adminSlice";

export default function AdminPremisesId() {
  const PREMISES_HEADER_IDS = {
    OPERATION_PK: 0,
    LAST_CHANGE_DATE: 1,
    CONTACT_FIRST_NAME: 2,
    CONTACT_LAST_NAME: 3,
    LEGAL_NAME: 4,
    ADDRESS_LINE_1: 5,
    ADDRESS_LINE_2: 6,
    CITY: 7,
    PROV_STATE: 8,
    POSTAL_ZIP_CODE: 9,
    PHONE: 10,
    CELL: 11,
    FAX: 12,
    EMAIL_ADDRESS: 13,
    LICENCE_NUMBER: 14,
    PRN: 15,
    SITE_ADDRESS: 16,
    CAPACITY: 17,
    REGION_NAME: 18,
    REGIONAL_DISTRICT_NAME: 19,
  };

  const IMPORT_TYPE = {
    NEW_LICENCE: 0,
    NEW_SITE: 1,
    UPDATE: 2,
    DO_NOT_IMPORT: 3,
  };

  const dispatch = useDispatch();
  const premisesIdResults = useSelector(selectPremisesIdResults);

  const [toggleAllChecked, setToggleAllChecked] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const inputFile = useRef(null);
  const [data, setData] = useState([]);
  const [results, setResults] = useState({
    data: undefined,
    page: undefined,
    count: 0,
    error: undefined,
  });

  useEffect(() => {
    setData([]);
    dispatch(clearPremisesIdResults());
  }, [dispatch]);

  function navigateToSearchPage(page) {
    const size = 20;
    const skip = (page - 1) * size;

    const readData = data.slice(skip, skip + size);
    setResults({
      data: readData,
      page,
      count: data.length,
      error: undefined,
    });
  }

  useEffect(() => {
    navigateToSearchPage(1);
  }, [data]);

  const validateStringValue = (value) => {
    if (value === null || value === undefined) {
      return undefined;
    }

    if (value === "" || value.length <= 0) {
      return undefined;
    }

    return value.replace(/[\\"]/g, "");
  };

  const onChangeFile = (event) => {
    const file = event.target.files[0];
    if (file === undefined) {
      return;
    }

    if (file.name.split(".").pop().toUpperCase() !== "CSV") {
      // TODO: Set some error about CSV only here
      return;
    }

    const readData = [];
    const reader = new FileReader();
    reader.onload = () => {
      const lines = reader.result.split("\n");

      // Toss out the header line
      lines.shift();

      while (typeof lines[0] !== "undefined") {
        const line = lines.shift();
        const split = line.split(",");

        const obj = {
          operationPk: undefined,
          lastChangeDate: undefined,
          contactFirstName: validateStringValue(
            split[PREMISES_HEADER_IDS.CONTACT_FIRST_NAME]
          ),
          contactLastName: validateStringValue(
            split[PREMISES_HEADER_IDS.CONTACT_LAST_NAME]
          ),
          legalName: validateStringValue(split[PREMISES_HEADER_IDS.LEGAL_NAME]),
          addressLine1: validateStringValue(
            split[PREMISES_HEADER_IDS.ADDRESS_LINE_1]
          ),
          addressLine2: validateStringValue(
            split[PREMISES_HEADER_IDS.ADDRESS_LINE_2]
          ),
          city: validateStringValue(split[PREMISES_HEADER_IDS.CITY]),
          provState: validateStringValue(split[PREMISES_HEADER_IDS.PROV_STATE]),
          postalZipCode: validateStringValue(
            split[PREMISES_HEADER_IDS.POSTAL_ZIP_CODE]
          ),
          phone: validateStringValue(split[PREMISES_HEADER_IDS.PHONE]),
          cell: validateStringValue(split[PREMISES_HEADER_IDS.CELL]),
          fax: validateStringValue(split[PREMISES_HEADER_IDS.FAX]),
          email: validateStringValue(split[PREMISES_HEADER_IDS.EMAIL_ADDRESS]),
          licenceNumber: validateStringValue(
            split[PREMISES_HEADER_IDS.LICENCE_NUMBER]
          ),
          prn: validateStringValue(split[PREMISES_HEADER_IDS.PRN]),
          siteAddress: validateStringValue(
            split[PREMISES_HEADER_IDS.SITE_ADDRESS]
          ),
          capacity: parseAsInt(split[PREMISES_HEADER_IDS.CAPACITY]),
          region: validateStringValue(split[PREMISES_HEADER_IDS.REGION_NAME]),
          district: validateStringValue(
            split[PREMISES_HEADER_IDS.REGIONAL_DISTRICT_NAME]
          ),
          importType: IMPORT_TYPE.NEW_LICENCE,
        };

        // Parse some values out
        if (obj.prn !== undefined) {
          readData.push(obj);
        }
      }

      setData(readData);
      setIsLoaded(true);
    };

    // Start reading the file
    // When it is done, calls the onload event defined above
    reader.readAsText(file);
  };

  const onButtonClick = () => {
    inputFile.current.click();
  };

  const submit = () => {
    const selectedRows = data.filter(
      (x) => x.importType !== IMPORT_TYPE.DO_NOT_IMPORT
    );
    dispatch(updatePremisesIdResults(selectedRows));
  };

  function formatResultRow(item) {
    return (
      <tr key={item.prn}>
        <td className="text-nowrap">{item.contactFirstName}</td>
        <td className="text-nowrap">{item.contactLastName}</td>
        <td className="text-nowrap">{item.legalName}</td>
        <td className="text-nowrap">{item.email}</td>
        <td className="text-nowrap">{item.prn}</td>
        <td className="text-nowrap">{item.siteAddress}</td>
        <td className="text-nowrap">
          <Form.Control
            type="text"
            name="licenceNumber"
            defaultValue={item.licenceNumber}
            onChange={(e) => {
              item.licenceNumber = e.target.value;
            }}
            style={{ width: 80 }}
          />
        </td>
        <td className="text-nowrap">
          <Form.Control
            type="text"
            name="siteId"
            defaultValue={item.siteId}
            onChange={(e) => {
              item.siteId = e.target.value;
            }}
            style={{ width: 80 }}
          />
        </td>
        <td className="text-nowrap">
          <Form.Control
            as="select"
            name="importType"
            onChange={(e) => {
              item.importType = parseAsInt(e.target.value);
            }}
            defaultValue={item.importType}
            style={{ width: 160 }}
          >
            <option
              key={IMPORT_TYPE.NEW_LICENCE}
              value={IMPORT_TYPE.NEW_LICENCE}
            >
              New Licence
            </option>
            <option key={IMPORT_TYPE.NEW_SITE} value={IMPORT_TYPE.NEW_SITE}>
              New Site
            </option>
            <option key={IMPORT_TYPE.UPDATE} value={IMPORT_TYPE.UPDATE}>
              Update
            </option>
            <option
              key={IMPORT_TYPE.DO_NOT_IMPORT}
              value={IMPORT_TYPE.DO_NOT_IMPORT}
            >
              Do Not Import
            </option>
          </Form.Control>
        </td>
      </tr>
    );
  }

  let content = null;

  const submitting = premisesIdResults.status === REQUEST_STATUS.PENDING;

  if (premisesIdResults.status === REQUEST_STATUS.FULFILLED) {
    content = (
      <>
        <div className="font-weight-bold">
          {premisesIdResults.data.successInsertCount} of{" "}
          {premisesIdResults.data.attemptCount} entries were loaded successfully
        </div>
      </>
    );
  } else if (isLoaded === false) {
    content = <Button onClick={onButtonClick}>Import</Button>;
  } else {
    let errorMessage = null;
    if (premisesIdResults.status === REQUEST_STATUS.REJECTED) {
      errorMessage = `${premisesIdResults.error.code}: ${premisesIdResults.error.description}`;
    }

    content = (
      <>
        <div>
          <Button variant="secondary" onClick={submit} disabled={submitting}>
            Confirm and add to Licences
          </Button>
          {premisesIdResults.status === REQUEST_STATUS.PENDING ? (
            <Spinner animation="border" role="status" variant="primary">
              <span className="sr-only">Working...</span>
            </Spinner>
          ) : null}
        </div>

        <ErrorMessageRow errorMessage={errorMessage} />

        <div className="mt-3">{data.length} entries found</div>
        <Table striped size="sm" responsive className="mt-3 mb-0" hover>
          <thead className="thead-dark">
            <tr>
              <th className="text-nowrap">First Name</th>
              <th className="text-nowrap">Last Name</th>
              <th className="text-nowrap">Company</th>
              <th className="text-nowrap">Email</th>
              <th className="text-nowrap">Premises ID</th>
              <th className="text-nowrap">Site Address</th>
              <th className="text-nowrap">Licence #</th>
              <th className="text-nowrap">Site ID</th>
              <th className="text-nowrap">Import Type</th>
            </tr>
          </thead>
          <tbody>{data.map((item) => formatResultRow(item))}</tbody>
        </Table>
      </>
    );
  }

  return (
    <>
      <PageHeading>Import Premises ID Information</PageHeading>
      <Container className="mt-3 mb-4">
        <input
          type="file"
          id="input"
          ref={inputFile}
          style={{ display: "none" }}
          onChange={onChangeFile}
          accept=".CSV"
        />
        {content}
      </Container>
    </>
  );
}

AdminPremisesId.propTypes = {};
