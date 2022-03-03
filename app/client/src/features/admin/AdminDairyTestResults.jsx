/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import readXlsxFile from "read-excel-file";
import {
  Spinner,
  Button,
  Table,
  Row,
  Col,
  ButtonGroup,
  Container,
} from "react-bootstrap";

import PageHeading from "../../components/PageHeading";
// import SectionHeading from "../../components/SectionHeading";
import ErrorMessageRow from "../../components/ErrorMessageRow";

import { parseAsInt, parseAsFloat } from "../../utilities/parsing";
import { REQUEST_STATUS } from "../../utilities/constants";
import {
  updateDairyTestResults,
  updateDairyTestResultCalculations,
  selectDairyTestResults,
  clearDairyTestResults,
} from "./adminSlice";

export default function AdminDairyTestResults() {
  const dispatch = useDispatch();
  const dairyTestResults = useSelector(selectDairyTestResults);

  const inputFile = useRef(null);
  const [data, setData] = useState([]);
  const [results, setResults] = useState({
    data: undefined,
    page: undefined,
    count: 0,
    error: undefined,
  });

  const DAIRY_HEADER_IDS = {
    IRMA: 0,
    PLANT: 1,
    TEST_MONTH: 2,
    TEST_YEAR: 3,
    TEST_DAY: 4,
    SPC_VALUE: 5,
    SCC_DAY: 6,
    SCC_VALUE: 7,
    WATER1_DAY: 8,
    WATER1_VALUE: 9,
    WATER2_DAY: 10,
    WATER2_VALUE: 11,
    IH_DAY: 12,
    IH_VALUE: 13,
  };

  useEffect(() => {
    setData([]);
    dispatch(clearDairyTestResults());
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

    return value;
  };

  const clearInputValue = (event) => {
    event.target.value = null;
  };

  const onChangeFile = (event) => {
    const file = event.target.files[0];
    if (file === undefined) {
      return;
    }

    if (file.name.split(".").pop().toUpperCase() !== "DAT") {
      // TODO: Set some error about DAT only here
      return;
    }

    const readData = [];
    const reader = new FileReader();
    reader.onload = () => {
      const lines = reader.result.split("\n");

      while (typeof lines[0] !== "undefined") {
        let line = lines.shift();
        line = line.replace(/\s/g, "");
        const split = line.split(",");

        const obj = {
          testJobId: undefined,
          licenceId: undefined,
          irmaNumber: split[DAIRY_HEADER_IDS.IRMA],
          plantCode: validateStringValue(split[DAIRY_HEADER_IDS.PLANT]),
          testMonth: parseAsInt(split[DAIRY_HEADER_IDS.TEST_MONTH]),
          testYear: parseAsInt(split[DAIRY_HEADER_IDS.TEST_YEAR]),
          // testDay: parseAsInt(split[DAIRY_HEADER_IDS.TEST_DAY]),
          spc1Day: validateStringValue(split[DAIRY_HEADER_IDS.TEST_DAY]),
          spc1Date: undefined,
          spc1Value: parseAsFloat(split[DAIRY_HEADER_IDS.SPC_VALUE]),
          spc1InfractionFlag: undefined,
          spc1PreviousInfractionFirstDate: undefined,
          spc1PreviousInfractionCount: undefined,
          spc1LevyPercentage: undefined,
          spc1Correspondence: undefined,
          spc1CorrespondenceDescription: undefined,
          sccDay: validateStringValue(split[DAIRY_HEADER_IDS.SCC_DAY]),
          sccDate: undefined,
          sccValue: parseAsFloat(split[DAIRY_HEADER_IDS.SCC_VALUE]),
          sccInfractionFlag: undefined,
          sccPreviousInfractionFirstDate: undefined,
          sccPreviousInfractionCount: undefined,
          sccLevyPercentage: undefined,
          sccCorrespondenceCode: undefined,
          sccCorrespondenceDescription: undefined,
          cryDay: validateStringValue(split[DAIRY_HEADER_IDS.WATER1_DAY]),
          cryDate: undefined,
          cryValue: parseAsFloat(split[DAIRY_HEADER_IDS.WATER1_VALUE]),
          cryInfractionFlag: undefined,
          cryPreviousInfractionFirstDate: undefined,
          cryPreviousInfractionCount: undefined,
          cryLevyPercentage: undefined,
          cryCorrespondenceCode: undefined,
          cryCorrespondenceDescription: undefined,
          ffaDay: undefined,
          ffaDate: undefined,
          ffaValue: undefined,
          ffaInfractionFlag: undefined,
          ffaPreviousInfractionFirstDate: undefined,
          ffaPreviousInfractionCount: undefined,
          ffaLevyPercentage: undefined,
          ffaCorrespondenceCode: undefined,
          ffaCorrespondenceDescription: undefined,
          ihDay: validateStringValue(split[DAIRY_HEADER_IDS.IH_DAY]),
          ihDate: undefined,
          ihValue: parseAsFloat(split[DAIRY_HEADER_IDS.IH_VALUE]),
          ihInfractionFlag: undefined,
          ihPreviousInfractionFirstDate: undefined,
          ihPreviousInfractionCount: undefined,
          ihLevyPercentage: undefined,
          ihCorrespondenceCode: undefined,
          ihCorrespondenceDescription: undefined,
        };

        // Parse some values out
        if (parseAsInt(obj.irmaNumber) !== null) {
          readData.push(obj);
        }
      }
      setData(readData);
    };

    // Start reading the file
    // When it is done, calls the onload event defined above
    reader.readAsText(file);
  };

  const onImportButtonClick = () => {
    inputFile.current.click();
  };

  const onRestartButtonClick = () => {
    setResults({
      data: undefined,
      page: undefined,
      count: 0,
      error: undefined,
    });
    setData([]);
    dispatch(clearDairyTestResults());
  };

  const submit = () => {
    dispatch(updateDairyTestResults(data));
  };

  function formatResultRow(result) {
    return (
      <tr key={result.irmaNumber}>
        <td className="text-nowrap">{result.irmaNumber}</td>
        <td className="text-nowrap">{result.plantCode}</td>
        <td className="text-nowrap">{result.testMonth}</td>
        <td className="text-nowrap">{result.testYear}</td>
        <td className="text-nowrap">{result.spc1Day}</td>
        <td className="text-nowrap">{result.spc1Value}</td>
        <td className="text-nowrap">{result.sccDay}</td>
        <td className="text-nowrap">{result.sccValue}</td>
        <td className="text-nowrap">{result.cryDay}</td>
        <td className="text-nowrap">{result.cryValue}</td>
        <td className="text-nowrap" />
        <td className="text-nowrap" />
        <td className="text-nowrap">{result.ihDay}</td>
        <td className="text-nowrap">{result.ihValue}</td>
      </tr>
    );
  }

  let control = null;

  const submitting = dairyTestResults.status === REQUEST_STATUS.PENDING;

  if (dairyTestResults.status === REQUEST_STATUS.FULFILLED) {
    control = (
      <>
        <div className="font-weight-bold">
          {dairyTestResults.data.successInsertCount} of{" "}
          {dairyTestResults.data.attemptCount} entries were loaded successfully
        </div>

        {dairyTestResults.data.licenceNoIrmaMatch.length > 0 ? (
          <div className="mt-3">
            <span className="font-weight-bold">
              The following IRMA Numbers are not matching IRMA Numbers on any
              Licence and were ignored:
            </span>
            {dairyTestResults.data.licenceNoIrmaMatch.map((x) => {
              return <div key={x.irmaNumber}>IRMA # {x.irmaNumber}</div>;
            })}
          </div>
        ) : null}
        <div>
          <Button onClick={onRestartButtonClick}>Import new file</Button>
        </div>
      </>
    );
  } else if (results.count === 0) {
    control = (
      <Button onClick={onImportButtonClick}>Import Dairy Test Results</Button>
    );
  } else {
    let errorMessage = null;
    if (dairyTestResults.status === REQUEST_STATUS.REJECTED) {
      errorMessage = `${dairyTestResults.error.code}: ${dairyTestResults.error.description}`;
    }

    control = (
      <>
        <div>
          <Button variant="secondary" onClick={submit} disabled={submitting}>
            Confirm and add to Licences
          </Button>
          {dairyTestResults.status === REQUEST_STATUS.PENDING ? (
            <Spinner animation="border" role="status" variant="primary">
              <span className="sr-only">Working...</span>
            </Spinner>
          ) : null}
          <span className="float-right">
            <Button onClick={onRestartButtonClick} disabled={submitting}>
              Import new file
            </Button>
          </span>
        </div>

        <ErrorMessageRow errorMessage={errorMessage} />

        <div className="mt-3">{results.count} entries found</div>
        <Table striped size="sm" responsive className="mt-3 mb-0" hover>
          <thead className="thead-dark">
            <tr>
              <th className="text-nowrap">IRMA #</th>
              <th className="text-nowrap">PLANT</th>
              <th className="text-nowrap">Test Month</th>
              <th className="text-nowrap">Test Year</th>
              <th className="text-nowrap">Test Day</th>
              <th className="text-nowrap">SPC Value</th>
              <th className="text-nowrap">SCC Day</th>
              <th className="text-nowrap">SCC Value</th>
              <th className="text-nowrap">Water1 Day</th>
              <th className="text-nowrap">Water1 Value</th>
              <th className="text-nowrap">Water2 Day</th>
              <th className="text-nowrap">Water2 Value</th>
              <th className="text-nowrap">IH Day</th>
              <th className="text-nowrap">IH Value</th>
              <th />
            </tr>
          </thead>
          <tbody>{results.data.map((result) => formatResultRow(result))}</tbody>
        </Table>
        <Row className="mt-3">
          <Col md="3" />
          <Col className="d-flex justify-content-center">
            Showing {results.data.length} of {results.count} entries
          </Col>
          <Col md="auto">
            <ButtonGroup>
              <Button
                disabled={results.page < 2}
                onClick={() => navigateToSearchPage((results.page ?? 2) - 1)}
              >
                Previous
              </Button>
              <Button disabled>{results.page}</Button>
              <Button
                disabled={results.page * 20 > results.count}
                onClick={() => navigateToSearchPage((results.page ?? 0) + 1)}
              >
                Next
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      </>
    );
  }

  return (
    <>
      <PageHeading>Dairy Test Result Confirmation</PageHeading>
      <Container className="mt-3 mb-4">
        <input
          type="file"
          id="input"
          ref={inputFile}
          style={{ display: "none" }}
          onChange={onChangeFile}
          onClick={clearInputValue} // Trick onChange to allow same file selection
          accept=".DAT"
        />
        {control}
      </Container>
    </>
  );
}

AdminDairyTestResults.propTypes = {};
