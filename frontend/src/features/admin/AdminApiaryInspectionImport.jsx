import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Button, Container, Spinner, Table } from "react-bootstrap";
import { useCSVReader } from "react-papaparse";

import PageHeading from "../../components/PageHeading";
import ErrorMessageRow from "../../components/ErrorMessageRow";
import { REQUEST_STATUS } from "../../utilities/constants";

import {
  importApiaryInspections,
  selectApiaryInspectionImport,
  clearApiaryInspectionImport,
} from "./adminSlice";
import {
  APIARY_INSPECTION_CSV_FIELDS,
  mapApiaryInspectionRows,
} from "./apiaryInspectionCsv";

const PREVIEW_ROW_LIMIT = 100;

// MALS2-124 - Import apiary inspections from a CHEFS CSV export.
// Modelled on AdminPremisesId: parse in the browser, preview, then post the rows to the backend,
// which validates each row, skips duplicates, and reports per-row errors.
export default function AdminApiaryInspectionImport() {
  const dispatch = useDispatch();
  const importResult = useSelector(selectApiaryInspectionImport);
  const { CSVReader } = useCSVReader();

  const [parsed, setParsed] = useState(null);

  useEffect(() => {
    dispatch(clearApiaryInspectionImport());
  }, [dispatch]);

  const onFileLoaded = (results) => {
    dispatch(clearApiaryInspectionImport());
    setParsed(results ? mapApiaryInspectionRows(results.data) : null);
  };

  const submit = () => {
    dispatch(importApiaryInspections(parsed.rows));
  };

  const fileButton = (label) => (
    <CSVReader onUploadAccepted={onFileLoaded}>
      {({ getRootProps }) => (
        <Button type="button" {...getRootProps()}>
          {label}
        </Button>
      )}
    </CSVReader>
  );

  const submitting = importResult.status === REQUEST_STATUS.PENDING;
  const canSubmit =
    parsed !== null &&
    parsed.missingRequired.length === 0 &&
    parsed.rows.length > 0 &&
    importResult.status !== REQUEST_STATUS.FULFILLED;

  let resultContent = null;
  if (importResult.status === REQUEST_STATUS.FULFILLED) {
    const r = importResult.data;
    resultContent = (
      <>
        <div className="font-weight-bold mt-3">
          {r.attemptCount} rows processed
          <ul>
            <li>{r.insertCount} inspections imported</li>
            <li>{r.duplicateCount} skipped as already imported</li>
            <li>{r.errorCount} rows with errors (not imported)</li>
          </ul>
        </div>
        {r.errors.length > 0 ? (
          <Table striped size="sm" responsive className="mt-3" hover>
            <thead className="thead-dark">
              <tr>
                <th className="text-nowrap">CSV Line</th>
                <th>Problem</th>
              </tr>
            </thead>
            <tbody>
              {r.errors.map((e) => (
                <tr key={e.rowNumber}>
                  <td>{e.rowNumber}</td>
                  <td>
                    {e.messages.map((m) => (
                      <div key={m}>{m}</div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : null}
      </>
    );
  }

  let previewContent = null;
  if (parsed !== null) {
    previewContent = (
      <>
        {parsed.missingRequired.length > 0 ? (
          <ErrorMessageRow
            errorMessage={`The file is missing required column(s): ${parsed.missingRequired.join(
              ", "
            )}.`}
          />
        ) : null}
        {parsed.ignoredHeaders.length > 0 ? (
          <Alert variant="warning" className="mt-3">
            These columns were not recognized and will be ignored:{" "}
            {parsed.ignoredHeaders.join(", ")}
          </Alert>
        ) : null}
        <div className="mt-3">
          {parsed.rows.length} rows found
          {parsed.rows.length > PREVIEW_ROW_LIMIT
            ? ` (showing first ${PREVIEW_ROW_LIMIT})`
            : ""}
        </div>
        <Table striped size="sm" responsive className="mt-3 mb-0" hover>
          <thead className="thead-dark">
            <tr>
              <th className="text-nowrap">CSV Line</th>
              {APIARY_INSPECTION_CSV_FIELDS.map((x) => (
                <th key={x.field} className="text-nowrap">
                  {x.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parsed.rows.slice(0, PREVIEW_ROW_LIMIT).map((row) => (
              <tr key={row.rowNumber}>
                <td>{row.rowNumber}</td>
                {APIARY_INSPECTION_CSV_FIELDS.map((x) => (
                  <td key={x.field} className="text-nowrap">
                    {row[x.field]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    );
  }

  let errorMessage = null;
  if (importResult.status === REQUEST_STATUS.REJECTED) {
    errorMessage = `${importResult.error.code}: ${importResult.error.description}`;
  }

  return (
    <>
      <PageHeading>Import Apiary Inspections</PageHeading>
      <Container className="mt-3 mb-4">
        <p>
          Import a CSV export of apiary inspections from CHEFS. Each row must
          have a Licence Number, Apiary Site ID and Inspection Date
          (YYYY-MM-DD). Rows that match an existing inspection (same site, date
          and inspector) are skipped, so a file can be safely re-imported.
        </p>
        <div className="d-flex align-items-center">
          {parsed !== null ? (
            <Button
              variant="secondary"
              className="mr-3"
              onClick={submit}
              disabled={!canSubmit || submitting}
            >
              Confirm and import inspections
            </Button>
          ) : null}
          {submitting ? (
            <Spinner
              animation="border"
              role="status"
              variant="primary"
              className="mr-3"
            >
              <span className="sr-only">Working...</span>
            </Spinner>
          ) : null}
          {fileButton(parsed === null ? "Import file" : "Import new file")}
        </div>
        <ErrorMessageRow errorMessage={errorMessage} />
        {resultContent}
        {previewContent}
      </Container>
    </>
  );
}
