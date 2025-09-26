import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Spinner, Table, Form, Button } from "react-bootstrap";
import { useCSVReader } from "react-papaparse";

import PageHeading from "../../components/PageHeading";
import ErrorMessageRow from "../../components/ErrorMessageRow";

import {
  parseAsInt,
  parseAsDate,
  isNullOrEmpty,
} from "../../utilities/parsing";

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
    SITE_CITY: 17,
    CAPACITY: 18,
    REGION_NAME: 19,
    REGIONAL_DISTRICT_NAME: 20,
  };

  const IMPORT_TYPE = {
    NEW_LICENCE: "NEW_LICENCE",
    NEW_SITE: "NEW_SITE",
    UPDATE: "UPDATE",
    DO_NOT_IMPORT: "DO_NOT_IMPORT",
  };

  const dispatch = useDispatch();
  const premisesIdResults = useSelector(selectPremisesIdResults);

  const { CSVReader } = useCSVReader();

  const [isLoaded, setIsLoaded] = useState(false);
  const [validationMessage, setValidationMessage] = useState(null);

  const inputFile = useRef(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    setData([]);
    dispatch(clearPremisesIdResults());
  }, [dispatch]);

  const validateStringValue = (value) => {
    if (value === null || value === undefined) {
      return undefined;
    }

    if (value === "" || value.length <= 0) {
      return undefined;
    }

    return value.replace(/[\\"]/g, "");
  };

  const validateIntValue = (value) => {
    return parseAsInt(validateStringValue(value));
  };

  const validateDateValue = (value) => {
    return parseAsDate(validateStringValue(value));
  };

  const validatePhoneValue = (value) => {
    if (value) {
      return value.replace(/[^0-9]/g, "");
    }

    return value;
  };

  const onChangeFile = (results) => {
    if (results === undefined) {
      return;
    }

    const readData = [];
    let id = 0;

    const resultData = results.data;

    for (let i = 1; i < resultData.length; i += 1) {
      const obj = {
        id,
        sourceOperationPk: validateIntValue(
          resultData[i][PREMISES_HEADER_IDS.OPERATION_PK]
        ),
        sourceLastChangeDate: validateDateValue(
          resultData[i][PREMISES_HEADER_IDS.LAST_CHANGE_DATE]
        ),
        registrantFirstName: validateStringValue(
          resultData[i][PREMISES_HEADER_IDS.CONTACT_FIRST_NAME]
        ),
        registrantLastName: validateStringValue(
          resultData[i][PREMISES_HEADER_IDS.CONTACT_LAST_NAME]
        ),
        licenceCompanyName: validateStringValue(
          resultData[i][PREMISES_HEADER_IDS.LEGAL_NAME]
        ),
        licenceMailAddress1: validateStringValue(
          resultData[i][PREMISES_HEADER_IDS.ADDRESS_LINE_1]
        ),
        licenceMailAddress2: validateStringValue(
          resultData[i][PREMISES_HEADER_IDS.ADDRESS_LINE_2]
        ),
        licenceMailCity: validateStringValue(
          resultData[i][PREMISES_HEADER_IDS.CITY]
        ),
        licenceMailProvince: validateStringValue(
          resultData[i][PREMISES_HEADER_IDS.PROV_STATE]
        ),
        licenceMailPostalCode: validateStringValue(
          resultData[i][PREMISES_HEADER_IDS.POSTAL_ZIP_CODE]
        ),
        registrantPrimaryPhone: validateStringValue(
          validatePhoneValue(resultData[i][PREMISES_HEADER_IDS.PHONE])
        ),
        registrantSecondaryPhone: validateStringValue(
          validatePhoneValue(resultData[i][PREMISES_HEADER_IDS.CELL])
        ),
        registrantFaxNumber: validateStringValue(
          validatePhoneValue(resultData[i][PREMISES_HEADER_IDS.FAX])
        ),
        registrantEmail: validateStringValue(
          resultData[i][PREMISES_HEADER_IDS.EMAIL_ADDRESS]
        ),
        licenceNumber: validateStringValue(
          resultData[i][PREMISES_HEADER_IDS.LICENCE_NUMBER]
        ),
        sitePremisesNumber: validateStringValue(
          resultData[i][PREMISES_HEADER_IDS.PRN]
        ),
        siteAddressLine1: validateStringValue(
          resultData[i][PREMISES_HEADER_IDS.SITE_ADDRESS]
        ),
        siteCity: validateStringValue(
          resultData[i][PREMISES_HEADER_IDS.SITE_CITY]
        ),
        licenceTotalHives: validateIntValue(
          resultData[i][PREMISES_HEADER_IDS.CAPACITY]
        ),
        siteRegionalName: validateStringValue(
          resultData[i][PREMISES_HEADER_IDS.REGION_NAME]
        ),
        siteRegionalDistrictName: validateStringValue(
          resultData[i][PREMISES_HEADER_IDS.REGIONAL_DISTRICT_NAME]
        ),
        siteId: null,
        apiarySiteId: null,
        importAction: IMPORT_TYPE.NEW_LICENCE,
      };

      // Don't add invalid objects
      if (obj.sitePremisesNumber !== undefined) {
        readData.push(obj);
      }
      id += 1;
    }

    setData(readData);
    setIsLoaded(true);
  };

  const onRestartButtonClick = () => {
    setValidationMessage(null);
    setData([]);
    dispatch(clearPremisesIdResults());
    setIsLoaded(false);
  };

  function validateData() {
    let isValid = true;
    data.forEach((x) => {
      if (x.importAction === IMPORT_TYPE.NEW_LICENCE) {
        if (
          isNullOrEmpty(x.registrantFirstName) &&
          isNullOrEmpty(x.registrantLastName)
        ) {
          setValidationMessage(
            "Registrant First & Last Name's are required when submitting a NEW LICENCE. Please update your import file and try again."
          );
          isValid = false;
        } else {
          if (isNullOrEmpty(x.registrantFirstName)) {
            setValidationMessage(
              "Registrant First Name is required when submitting a NEW LICENCE. Please update your import file and try again."
            );
            isValid = false;
          }

          if (isNullOrEmpty(x.registrantLastName)) {
            setValidationMessage(
              "Registrant Last Name is required when submitting a NEW LICENCE. Please update your import file and try again."
            );
            isValid = false;
          }
        }
      }

      if (x.importAction === IMPORT_TYPE.NEW_SITE) {
        if (isNullOrEmpty(x.licenceNumber)) {
          setValidationMessage(
            "Licence Number is required when submitting a NEW SITE."
          );
          isValid = false;
        }
      }

      if (x.importAction === IMPORT_TYPE.UPDATE) {
        if (isNullOrEmpty(x.licenceNumber) && isNullOrEmpty(x.apiarySiteId)) {
          setValidationMessage(
            "Licence Number & Apiary Site ID are required when submitting an UPDATE."
          );
          isValid = false;
        } else {
          if (
            !isNullOrEmpty(x.apiarySiteId) &&
            x.apiarySiteId.toString().length > 3
          ) {
            setValidationMessage(
              "Apiary Site ID cannot exceed 3 characters (eg: 100)"
            );
            isValid = false;
          }

          if (isNullOrEmpty(x.apiarySiteId)) {
            setValidationMessage(
              "Apiary Site ID is required when submitting an UPDATE."
            );
            isValid = false;
          }

          if (isNullOrEmpty(x.licenceNumber)) {
            setValidationMessage(
              "Licence Number is required when submitting an UPDATE."
            );
            isValid = false;
          }
        }
      }

      if (x.licenceMailPostalCode.replace(" ", "").length > 6) {
        setValidationMessage(
          "Postal Code cannot be longer than 6 characters. Please update your import file and try again."
        );
        isValid = false;
      }
    });

    if (isValid) {
      setValidationMessage(null);
    }
    return isValid;
  }

  const submit = () => {
    if (validateData()) {
      dispatch(updatePremisesIdResults(data));
    }
  };

  function formatResultRow(item) {
    return (
      <tr key={item.id}>
        <td className="text-nowrap">{item.registrantFirstName}</td>
        <td className="text-nowrap">{item.registrantLastName}</td>
        <td className="text-nowrap">{item.licenceCompanyName}</td>
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
            name="apiarySiteId"
            defaultValue={item.apiarySiteId}
            onChange={(e) => {
              item.apiarySiteId = parseAsInt(e.target.value);
            }}
            style={{ width: 140 }}
          />
        </td>
        <td className="text-nowrap">
          <Form.Control
            as="select"
            name="importAction"
            onChange={(e) => {
              item.importAction = e.target.value;
            }}
            defaultValue={item.importAction}
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
        <td className="text-nowrap">{item.registrantEmail}</td>
        <td className="text-nowrap">{item.siteAddressLine1}</td>
        <td className="text-nowrap">{item.sitePremisesNumber}</td>
      </tr>
    );
  }

  let content = null;

  const submitting = premisesIdResults.status === REQUEST_STATUS.PENDING;

  if (premisesIdResults.status === REQUEST_STATUS.FULFILLED) {
    content = (
      <>
        <div className="font-weight-bold">
          {premisesIdResults.data.attemptCount} entries processed
          <ul>
            <li>
              {premisesIdResults.data.insertCount} entries inserted successfully
            </li>
            <li>
              {premisesIdResults.data.updateCount} entries updated successfully
            </li>
            <li>
              {premisesIdResults.data.doNotInsertCount} entries not imported
            </li>
          </ul>
        </div>
        {premisesIdResults.data.status === "WARNING" ? (
          <>
            <div className="font-weight-bold">
              {premisesIdResults.data.status}!{" "}
              {premisesIdResults.data.comment.includes(
                "One or more of the rows was not successfully processed"
              )
                ? "One or more of the rows was not successfully processed. Please contact a system administrator."
                : premisesIdResults.data.comment}
            </div>
          </>
        ) : null}
        <div>
          <CSVReader
            onUploadAccepted={(results) => {
              onRestartButtonClick();
              onChangeFile(results);
            }}
          >
            {({ getRootProps }) => (
              <>
                <div>
                  <Button type="button" {...getRootProps()}>
                    Import new file
                  </Button>
                </div>
              </>
            )}
          </CSVReader>
        </div>
      </>
    );
  } else if (isLoaded === false) {
    content = (
      <>
        <CSVReader
          onUploadAccepted={(results) => {
            onChangeFile(results);
          }}
        >
          {({ getRootProps }) => (
            <>
              <div>
                <Button type="button" {...getRootProps()}>
                  Import file
                </Button>
              </div>
            </>
          )}
        </CSVReader>
      </>
    );
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
          <span className="float-right">
            <CSVReader
              onUploadAccepted={(results) => {
                onRestartButtonClick();
                onChangeFile(results);
              }}
            >
              {({ getRootProps }) => (
                <>
                  <div>
                    <Button type="button" {...getRootProps()}>
                      Import new file
                    </Button>
                  </div>
                </>
              )}
            </CSVReader>
          </span>
        </div>

        <ErrorMessageRow errorMessage={errorMessage} />
        <ErrorMessageRow errorMessage={validationMessage} />

        <div className="mt-3">{data.length} entries found</div>
        <Table striped size="sm" responsive className="mt-3 mb-0" hover>
          <thead className="thead-dark">
            <tr>
              <th className="text-nowrap">First Name</th>
              <th className="text-nowrap">Last Name</th>
              <th className="text-nowrap">Company</th>
              <th className="text-nowrap">Licence #</th>
              <th className="text-nowrap">Apiary Site ID</th>
              <th className="text-nowrap">Import Type</th>
              <th className="text-nowrap">Email</th>
              <th className="text-nowrap">Site Address</th>
              <th className="text-nowrap">Premises ID</th>
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
      <Container className="mt-3 mb-4">{content}</Container>
    </>
  );
}

AdminPremisesId.propTypes = {};
